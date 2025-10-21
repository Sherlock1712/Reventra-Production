import sql from '@/app/api/utils/sql';

// GET /api/customers - List all customers with search
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let query = `
      SELECT 
        c.id, c.name, c.phone, c.email, c.address, c.date_of_birth, c.gender,
        c.created_at, c.updated_at,
        COUNT(s.id) as total_orders,
        COALESCE(SUM(s.final_amount), 0) as total_purchases,
        MAX(s.created_at) as last_visit
      FROM customers c
      LEFT JOIN sales s ON c.id = s.customer_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // Add search filter
    if (search) {
      paramCount++;
      query += ` AND (
        LOWER(c.name) LIKE LOWER($${paramCount}) OR 
        c.phone LIKE $${paramCount} OR 
        LOWER(c.email) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${search}%`);
    }

    query += ` 
      GROUP BY c.id, c.name, c.phone, c.email, c.address, c.date_of_birth, c.gender, c.created_at, c.updated_at
      ORDER BY c.name ASC
    `;

    const customers = await sql(query, params);
    
    // Format the response
    const formattedCustomers = customers.map(customer => ({
      ...customer,
      total_purchases: `₹${parseFloat(customer.total_purchases).toLocaleString('en-IN')}`,
      last_visit: customer.last_visit ? customer.last_visit.toISOString().split('T')[0] : 'Never'
    }));

    return Response.json({ 
      customers: formattedCustomers,
      count: customers.length 
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return Response.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

// POST /api/customers - Create new customer
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, email, address, date_of_birth, gender } = body;

    // Validation
    if (!name || !phone) {
      return Response.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    // Check if phone already exists
    const existingCustomer = await sql`
      SELECT id FROM customers WHERE phone = ${phone}
    `;

    if (existingCustomer.length > 0) {
      return Response.json({ error: 'Customer with this phone number already exists' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO customers (name, phone, email, address, date_of_birth, gender)
      VALUES (${name}, ${phone}, ${email || null}, ${address || null}, ${date_of_birth || null}, ${gender || null})
      RETURNING *
    `;

    return Response.json({ 
      customer: result[0],
      message: 'Customer added successfully' 
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return Response.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}