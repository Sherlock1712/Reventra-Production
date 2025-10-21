import sql from '@/app/api/utils/sql';

// GET /api/prescriptions - List all prescriptions with filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    let query = `
      SELECT 
        p.id, p.prescription_number, p.doctor_name, p.prescription_date, 
        p.file_url, p.status, p.notes, p.created_at, p.updated_at,
        c.id as customer_id, c.name as customer_name, c.phone as customer_phone,
        COUNT(pi.id) as item_count,
        COUNT(CASE WHEN pi.status = 'fulfilled' THEN 1 END) as fulfilled_count
      FROM prescriptions p
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN prescription_items pi ON p.id = pi.prescription_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // Add search filter
    if (search) {
      paramCount++;
      query += ` AND (
        p.prescription_number LIKE $${paramCount} OR 
        LOWER(c.name) LIKE LOWER($${paramCount}) OR 
        c.phone LIKE $${paramCount} OR
        LOWER(p.doctor_name) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${search}%`);
    }

    // Add status filter
    if (status && status !== 'all') {
      paramCount++;
      query += ` AND p.status = $${paramCount}`;
      params.push(status);
    }

    query += ` 
      GROUP BY p.id, p.prescription_number, p.doctor_name, p.prescription_date, 
               p.file_url, p.status, p.notes, p.created_at, p.updated_at,
               c.id, c.name, c.phone
      ORDER BY p.created_at DESC
    `;

    const prescriptions = await sql(query, params);
    
    return Response.json({ 
      prescriptions,
      count: prescriptions.length 
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return Response.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
  }
}

// POST /api/prescriptions - Create new prescription
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customer_id, doctor_name, prescription_date, file_url, notes = ''
    } = body;

    // Validation
    if (!customer_id) {
      return Response.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // Check if customer exists
    const customer = await sql`SELECT id FROM customers WHERE id = ${customer_id}`;
    if (customer.length === 0) {
      return Response.json({ error: 'Customer not found' }, { status: 400 });
    }

    // Generate prescription number
    const prescResult = await sql`
      SELECT COALESCE(MAX(CAST(SUBSTRING(prescription_number FROM 6) AS INTEGER)), 0) + 1 as next_number
      FROM prescriptions 
      WHERE prescription_number LIKE 'PRESC%'
    `;
    const prescriptionNumber = `PRESC${prescResult[0].next_number.toString().padStart(4, '0')}`;

    const result = await sql`
      INSERT INTO prescriptions (
        customer_id, prescription_number, doctor_name, prescription_date, file_url, notes
      ) VALUES (
        ${customer_id}, ${prescriptionNumber}, ${doctor_name || ''}, 
        ${prescription_date || null}, ${file_url || null}, ${notes}
      ) RETURNING *
    `;

    return Response.json({ 
      prescription: result[0],
      message: 'Prescription created successfully' 
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    return Response.json({ error: 'Failed to create prescription' }, { status: 500 });
  }
}