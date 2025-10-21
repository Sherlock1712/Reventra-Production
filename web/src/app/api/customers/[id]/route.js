import sql from '@/app/api/utils/sql';

// GET /api/customers/[id] - Get single customer with purchase history
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const customerResult = await sql`
      SELECT 
        c.id, c.name, c.phone, c.email, c.address, c.date_of_birth, c.gender,
        c.created_at, c.updated_at,
        COUNT(s.id) as total_orders,
        COALESCE(SUM(s.final_amount), 0) as total_purchases,
        MAX(s.created_at) as last_visit
      FROM customers c
      LEFT JOIN sales s ON c.id = s.customer_id
      WHERE c.id = ${id}
      GROUP BY c.id, c.name, c.phone, c.email, c.address, c.date_of_birth, c.gender, c.created_at, c.updated_at
    `;

    if (customerResult.length === 0) {
      return Response.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Get recent sales for this customer
    const salesResult = await sql`
      SELECT 
        s.id, s.bill_number, s.final_amount, s.payment_method, s.created_at,
        COUNT(si.id) as item_count
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE s.customer_id = ${id}
      GROUP BY s.id, s.bill_number, s.final_amount, s.payment_method, s.created_at
      ORDER BY s.created_at DESC
      LIMIT 10
    `;

    const customer = {
      ...customerResult[0],
      total_purchases: `₹${parseFloat(customerResult[0].total_purchases).toLocaleString('en-IN')}`,
      last_visit: customerResult[0].last_visit ? customerResult[0].last_visit.toISOString().split('T')[0] : 'Never',
      recent_sales: salesResult
    };

    return Response.json({ customer });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return Response.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Check if customer exists
    const existing = await sql`SELECT id FROM customers WHERE id = ${id}`;
    if (existing.length === 0) {
      return Response.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 0;

    const allowedFields = ['name', 'phone', 'email', 'address', 'date_of_birth', 'gender'];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        paramCount++;
        updates.push(`${field} = $${paramCount}`);
        values.push(body[field] || null);
      }
    }

    if (updates.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Check if phone is being updated and already exists
    if (body.phone) {
      const phoneCheck = await sql`
        SELECT id FROM customers WHERE phone = ${body.phone} AND id != ${id}
      `;
      if (phoneCheck.length > 0) {
        return Response.json({ error: 'Phone number already exists' }, { status: 400 });
      }
    }

    // Add updated_at timestamp
    paramCount++;
    updates.push(`updated_at = $${paramCount}`);
    values.push(new Date().toISOString());

    // Add ID for WHERE clause
    paramCount++;
    values.push(id);

    const query = `
      UPDATE customers 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await sql(query, values);

    return Response.json({ 
      customer: result[0],
      message: 'Customer updated successfully' 
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return Response.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Check if customer exists
    const existing = await sql`SELECT name FROM customers WHERE id = ${id}`;
    if (existing.length === 0) {
      return Response.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Check if customer has any sales or prescriptions
    const usageCheck = await sql`
      SELECT 1 FROM sales WHERE customer_id = ${id}
      UNION
      SELECT 1 FROM prescriptions WHERE customer_id = ${id}
      LIMIT 1
    `;

    if (usageCheck.length > 0) {
      return Response.json({ 
        error: 'Cannot delete customer. They have sales or prescription history.' 
      }, { status: 400 });
    }

    // Delete the customer
    await sql`DELETE FROM customers WHERE id = ${id}`;

    return Response.json({ 
      message: `Customer "${existing[0].name}" deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return Response.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}