import sql from '@/app/api/utils/sql';

// GET /api/sales - List all sales with filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const paymentMethod = searchParams.get('paymentMethod') || '';

    let query = `
      SELECT 
        s.id, s.bill_number, s.total_amount, s.discount_amount, s.gst_amount, 
        s.final_amount, s.payment_method, s.payment_status, s.notes, s.created_at,
        c.name as customer_name, c.phone as customer_phone,
        COUNT(si.id) as item_count
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // Add search filter
    if (search) {
      paramCount++;
      query += ` AND (
        s.bill_number LIKE $${paramCount} OR 
        LOWER(c.name) LIKE LOWER($${paramCount}) OR 
        c.phone LIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }

    // Add date range filter
    if (startDate) {
      paramCount++;
      query += ` AND DATE(s.created_at) >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND DATE(s.created_at) <= $${paramCount}`;
      params.push(endDate);
    }

    // Add payment method filter
    if (paymentMethod && paymentMethod !== 'all') {
      paramCount++;
      query += ` AND s.payment_method = $${paramCount}`;
      params.push(paymentMethod);
    }

    query += ` 
      GROUP BY s.id, s.bill_number, s.total_amount, s.discount_amount, s.gst_amount, 
               s.final_amount, s.payment_method, s.payment_status, s.notes, s.created_at,
               c.name, c.phone
      ORDER BY s.created_at DESC
    `;

    const sales = await sql(query, params);
    
    return Response.json({ 
      sales,
      count: sales.length 
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return Response.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

// POST /api/sales - Create new sale
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customer_id, items, discount_amount = 0, payment_method, notes = ''
    } = body;

    // Validation
    if (!items || items.length === 0) {
      return Response.json({ error: 'No items provided' }, { status: 400 });
    }

    if (!payment_method) {
      return Response.json({ error: 'Payment method is required' }, { status: 400 });
    }

    // Validate each item and check stock
    for (const item of items) {
      if (!item.medicine_id || !item.quantity || item.quantity <= 0) {
        return Response.json({ error: 'Invalid item data' }, { status: 400 });
      }

      // Check stock availability
      const medicine = await sql`
        SELECT stock, name, price FROM medicines WHERE id = ${item.medicine_id}
      `;

      if (medicine.length === 0) {
        return Response.json({ error: `Medicine with ID ${item.medicine_id} not found` }, { status: 400 });
      }

      if (medicine[0].stock < item.quantity) {
        return Response.json({ 
          error: `Insufficient stock for ${medicine[0].name}. Available: ${medicine[0].stock}, Required: ${item.quantity}` 
        }, { status: 400 });
      }
    }

    // Generate bill number
    const billResult = await sql`
      SELECT COALESCE(MAX(CAST(SUBSTRING(bill_number FROM 5) AS INTEGER)), 0) + 1 as next_number
      FROM sales 
      WHERE bill_number LIKE 'BILL%'
    `;
    const billNumber = `BILL${billResult[0].next_number.toString().padStart(4, '0')}`;

    // Calculate totals
    let totalAmount = 0;
    let totalGst = 0;
    const calculatedItems = [];

    for (const item of items) {
      const medicine = await sql`
        SELECT price, gst_percentage FROM medicines WHERE id = ${item.medicine_id}
      `;
      
      const unitPrice = parseFloat(medicine[0].price);
      const gstPercentage = parseFloat(medicine[0].gst_percentage);
      const itemTotal = unitPrice * item.quantity;
      const itemGst = (itemTotal * gstPercentage) / 100;

      calculatedItems.push({
        medicine_id: item.medicine_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: itemTotal,
        gst_amount: itemGst
      });

      totalAmount += itemTotal;
      totalGst += itemGst;
    }

    const finalAmount = totalAmount + totalGst - discount_amount;

    // Start transaction
    const result = await sql.transaction(async (txn) => {
      // Create sale record
      const saleResult = await txn`
        INSERT INTO sales (
          customer_id, bill_number, total_amount, discount_amount, 
          gst_amount, final_amount, payment_method, notes
        ) VALUES (
          ${customer_id || null}, ${billNumber}, ${totalAmount}, ${discount_amount},
          ${totalGst}, ${finalAmount}, ${payment_method}, ${notes}
        ) RETURNING *
      `;

      const saleId = saleResult[0].id;

      // Create sale items (this will trigger stock update via trigger)
      for (const item of calculatedItems) {
        await txn`
          INSERT INTO sale_items (
            sale_id, medicine_id, quantity, unit_price, total_price, gst_amount
          ) VALUES (
            ${saleId}, ${item.medicine_id}, ${item.quantity}, 
            ${item.unit_price}, ${item.total_price}, ${item.gst_amount}
          )
        `;
      }

      return saleResult[0];
    });

    return Response.json({ 
      sale: result,
      message: 'Sale completed successfully' 
    });
  } catch (error) {
    console.error('Error creating sale:', error);
    return Response.json({ error: 'Failed to create sale' }, { status: 500 });
  }
}