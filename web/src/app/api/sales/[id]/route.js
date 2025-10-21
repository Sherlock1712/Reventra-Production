import sql from '@/app/api/utils/sql';

// GET /api/sales/[id] - Get single sale with detailed line items
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Get sale details
    const saleResult = await sql`
      SELECT 
        s.id, s.bill_number, s.total_amount, s.discount_amount, s.gst_amount, 
        s.final_amount, s.payment_method, s.payment_status, s.notes, s.created_at,
        c.id as customer_id, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ${id}
    `;

    if (saleResult.length === 0) {
      return Response.json({ error: 'Sale not found' }, { status: 404 });
    }

    // Get sale items
    const itemsResult = await sql`
      SELECT 
        si.id, si.quantity, si.unit_price, si.total_price, si.gst_amount,
        m.id as medicine_id, m.name as medicine_name, m.brand, m.category
      FROM sale_items si
      JOIN medicines m ON si.medicine_id = m.id
      WHERE si.sale_id = ${id}
      ORDER BY m.name
    `;

    const sale = {
      ...saleResult[0],
      items: itemsResult
    };

    return Response.json({ sale });
  } catch (error) {
    console.error('Error fetching sale:', error);
    return Response.json({ error: 'Failed to fetch sale' }, { status: 500 });
  }
}

// PUT /api/sales/[id] - Update sale (limited fields only)
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Check if sale exists
    const existing = await sql`SELECT id, payment_status FROM sales WHERE id = ${id}`;
    if (existing.length === 0) {
      return Response.json({ error: 'Sale not found' }, { status: 404 });
    }

    // Only allow updating certain fields after sale is created
    const allowedFields = ['payment_status', 'notes'];
    const updates = [];
    const values = [];
    let paramCount = 0;

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        paramCount++;
        updates.push(`${field} = $${paramCount}`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Add ID for WHERE clause
    paramCount++;
    values.push(id);

    const query = `
      UPDATE sales 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await sql(query, values);

    return Response.json({ 
      sale: result[0],
      message: 'Sale updated successfully' 
    });
  } catch (error) {
    console.error('Error updating sale:', error);
    return Response.json({ error: 'Failed to update sale' }, { status: 500 });
  }
}

// DELETE /api/sales/[id] - Cancel/void sale (reverses stock)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Check if sale exists and get details
    const saleResult = await sql`
      SELECT s.id, s.bill_number, s.payment_status, c.name as customer_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ${id}
    `;

    if (saleResult.length === 0) {
      return Response.json({ error: 'Sale not found' }, { status: 404 });
    }

    const sale = saleResult[0];

    // Only allow cancellation within reasonable time (e.g., same day)
    const saleDate = await sql`
      SELECT DATE(created_at) as sale_date FROM sales WHERE id = ${id}
    `;
    
    const today = new Date().toISOString().split('T')[0];
    if (saleDate[0].sale_date !== today) {
      return Response.json({ 
        error: 'Sales can only be cancelled on the same day they were made' 
      }, { status: 400 });
    }

    // Start transaction to reverse the sale
    await sql.transaction(async (txn) => {
      // Get all sale items to reverse stock
      const items = await txn`
        SELECT medicine_id, quantity FROM sale_items WHERE sale_id = ${id}
      `;

      // Reverse stock for each item
      for (const item of items) {
        await txn`
          UPDATE medicines 
          SET stock = stock + ${item.quantity}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${item.medicine_id}
        `;

        // Record stock movement
        await txn`
          INSERT INTO stock_movements (medicine_id, movement_type, quantity, reason, reference_id, reference_type)
          VALUES (${item.medicine_id}, 'in', ${item.quantity}, 'Sale cancellation', ${id}, 'sale_cancel')
        `;
      }

      // Delete sale items (cascade will handle this, but being explicit)
      await txn`DELETE FROM sale_items WHERE sale_id = ${id}`;
      
      // Delete the sale
      await txn`DELETE FROM sales WHERE id = ${id}`;
    });

    return Response.json({ 
      message: `Sale ${sale.bill_number} has been cancelled and stock has been restored` 
    });
  } catch (error) {
    console.error('Error cancelling sale:', error);
    return Response.json({ error: 'Failed to cancel sale' }, { status: 500 });
  }
}