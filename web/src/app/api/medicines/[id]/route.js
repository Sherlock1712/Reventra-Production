import sql from '@/app/api/utils/sql';

// GET /api/medicines/[id] - Get single medicine
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const result = await sql`
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
      WHERE id = ${id}
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Medicine not found' }, { status: 404 });
    }

    return Response.json({ medicine: result[0] });
  } catch (error) {
    console.error('Error fetching medicine:', error);
    return Response.json({ error: 'Failed to fetch medicine' }, { status: 500 });
  }
}

// PUT /api/medicines/[id] - Update medicine
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Check if medicine exists
    const existing = await sql`SELECT id FROM medicines WHERE id = ${id}`;
    if (existing.length === 0) {
      return Response.json({ error: 'Medicine not found' }, { status: 404 });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 0;

    // List of updatable fields
    const allowedFields = [
      'name', 'brand', 'category', 'stock', 'min_stock', 'price', 'cost_price',
      'gst_percentage', 'batch_number', 'expiry_date', 'manufacturer', 'composition'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        paramCount++;
        updates.push(`${field} = $${paramCount}`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Add updated_at timestamp
    paramCount++;
    updates.push(`updated_at = $${paramCount}`);
    values.push(new Date().toISOString());

    // Add ID for WHERE clause
    paramCount++;
    values.push(id);

    const query = `
      UPDATE medicines 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await sql(query, values);

    return Response.json({ 
      medicine: result[0],
      message: 'Medicine updated successfully' 
    });
  } catch (error) {
    console.error('Error updating medicine:', error);
    return Response.json({ error: 'Failed to update medicine' }, { status: 500 });
  }
}

// DELETE /api/medicines/[id] - Delete medicine
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Check if medicine exists
    const existing = await sql`SELECT name FROM medicines WHERE id = ${id}`;
    if (existing.length === 0) {
      return Response.json({ error: 'Medicine not found' }, { status: 404 });
    }

    // Check if medicine is used in any sales or prescriptions
    const usageCheck = await sql`
      SELECT 1 FROM sale_items WHERE medicine_id = ${id}
      UNION
      SELECT 1 FROM prescription_items WHERE medicine_id = ${id}
      LIMIT 1
    `;

    if (usageCheck.length > 0) {
      return Response.json({ 
        error: 'Cannot delete medicine. It has been used in sales or prescriptions.' 
      }, { status: 400 });
    }

    // Delete the medicine
    await sql`DELETE FROM medicines WHERE id = ${id}`;

    return Response.json({ 
      message: `Medicine "${existing[0].name}" deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting medicine:', error);
    return Response.json({ error: 'Failed to delete medicine' }, { status: 500 });
  }
}