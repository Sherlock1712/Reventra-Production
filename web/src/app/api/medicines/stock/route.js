import sql from '@/app/api/utils/sql';

// POST /api/medicines/stock - Adjust stock levels
export async function POST(request) {
  try {
    const body = await request.json();
    const { medicine_id, quantity, movement_type, reason } = body;

    // Validation
    if (!medicine_id || quantity === undefined || !movement_type || !reason) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['in', 'out', 'adjustment'].includes(movement_type)) {
      return Response.json({ error: 'Invalid movement type' }, { status: 400 });
    }

    // Check if medicine exists
    const medicine = await sql`
      SELECT id, name, stock FROM medicines WHERE id = ${medicine_id}
    `;

    if (medicine.length === 0) {
      return Response.json({ error: 'Medicine not found' }, { status: 404 });
    }

    const currentStock = medicine[0].stock;
    let newStock;

    // Calculate new stock based on movement type
    if (movement_type === 'in') {
      newStock = currentStock + Math.abs(quantity);
    } else if (movement_type === 'out') {
      newStock = currentStock - Math.abs(quantity);
      if (newStock < 0) {
        return Response.json({ 
          error: `Insufficient stock. Current: ${currentStock}, Requested: ${Math.abs(quantity)}` 
        }, { status: 400 });
      }
    } else { // adjustment
      newStock = Math.abs(quantity);
    }

    // Start transaction
    const result = await sql.transaction(async (txn) => {
      // Update medicine stock
      const updatedMedicine = await txn`
        UPDATE medicines 
        SET stock = ${newStock}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${medicine_id}
        RETURNING *
      `;

      // Record stock movement
      await txn`
        INSERT INTO stock_movements (medicine_id, movement_type, quantity, reason, reference_type)
        VALUES (
          ${medicine_id}, 
          ${movement_type}, 
          ${movement_type === 'adjustment' ? (newStock - currentStock) : (movement_type === 'in' ? Math.abs(quantity) : -Math.abs(quantity))}, 
          ${reason}, 
          'manual'
        )
      `;

      return updatedMedicine[0];
    });

    return Response.json({ 
      medicine: result,
      message: `Stock ${movement_type === 'in' ? 'added' : movement_type === 'out' ? 'removed' : 'adjusted'} successfully`
    });
  } catch (error) {
    console.error('Error adjusting stock:', error);
    return Response.json({ error: 'Failed to adjust stock' }, { status: 500 });
  }
}