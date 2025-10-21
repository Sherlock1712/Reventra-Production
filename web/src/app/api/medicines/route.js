import sql from '@/app/api/utils/sql';

// GET /api/medicines - List all medicines with filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';

    let query = `
      SELECT 
        id, name, brand, category, stock, min_stock, price, cost_price,
        gst_percentage, batch_number, expiry_date, manufacturer, composition,
        CASE 
          WHEN stock <= min_stock THEN 'low'
          WHEN expiry_date <= CURRENT_DATE + INTERVAL '3 months' THEN 'expiring'
          ELSE 'good'
        END as status,
        created_at, updated_at
      FROM medicines 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // Add search filter
    if (search) {
      paramCount++;
      query += ` AND (LOWER(name) LIKE LOWER($${paramCount}) OR LOWER(brand) LIKE LOWER($${paramCount}) OR LOWER(category) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
    }

    // Add category filter
    if (category) {
      paramCount++;
      query += ` AND LOWER(category) = LOWER($${paramCount})`;
      params.push(category);
    }

    // Add status filter
    if (status && status !== 'all') {
      if (status === 'low') {
        query += ` AND stock <= min_stock`;
      } else if (status === 'expiring') {
        query += ` AND expiry_date <= CURRENT_DATE + INTERVAL '3 months' AND stock > min_stock`;
      } else if (status === 'good') {
        query += ` AND stock > min_stock AND expiry_date > CURRENT_DATE + INTERVAL '3 months'`;
      }
    }

    query += ` ORDER BY name ASC`;

    const medicines = await sql(query, params);
    
    return Response.json({ 
      medicines,
      count: medicines.length 
    });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    return Response.json({ error: 'Failed to fetch medicines' }, { status: 500 });
  }
}

// POST /api/medicines - Create new medicine
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name, brand, category, stock, min_stock, price, cost_price,
      gst_percentage, batch_number, expiry_date, manufacturer, composition
    } = body;

    // Validation
    if (!name || !brand || !category || !batch_number || !expiry_date) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (price <= 0 || cost_price <= 0 || stock < 0 || min_stock < 0) {
      return Response.json({ error: 'Invalid numeric values' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO medicines (
        name, brand, category, stock, min_stock, price, cost_price,
        gst_percentage, batch_number, expiry_date, manufacturer, composition
      ) VALUES (
        ${name}, ${brand}, ${category}, ${stock || 0}, ${min_stock || 0}, 
        ${price}, ${cost_price}, ${gst_percentage || 12}, ${batch_number}, 
        ${expiry_date}, ${manufacturer || ''}, ${composition || ''}
      ) RETURNING *
    `;

    // Record initial stock movement
    if (stock > 0) {
      await sql`
        INSERT INTO stock_movements (medicine_id, movement_type, quantity, reason, reference_type)
        VALUES (${result[0].id}, 'in', ${stock}, 'Initial stock', 'initial')
      `;
    }

    return Response.json({ 
      medicine: result[0],
      message: 'Medicine added successfully' 
    });
  } catch (error) {
    console.error('Error creating medicine:', error);
    return Response.json({ error: 'Failed to create medicine' }, { status: 500 });
  }
}