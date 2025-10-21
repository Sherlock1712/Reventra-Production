import sql from '@/app/api/utils/sql';

// GET /api/reports/dashboard - Get dashboard analytics
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today'; // today, week, month, year

    let dateFilter = '';
    switch (period) {
      case 'today':
        dateFilter = "DATE(created_at) = CURRENT_DATE";
        break;
      case 'week':
        dateFilter = "created_at >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "created_at >= CURRENT_DATE - INTERVAL '30 days'";
        break;
      case 'year':
        dateFilter = "created_at >= CURRENT_DATE - INTERVAL '365 days'";
        break;
      default:
        dateFilter = "DATE(created_at) = CURRENT_DATE";
    }

    // Get sales analytics
    const salesStats = await sql`
      SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(final_amount), 0) as total_revenue,
        COALESCE(AVG(final_amount), 0) as avg_order_value,
        COALESCE(SUM(gst_amount), 0) as total_gst
      FROM sales 
      WHERE ${sql.raw(dateFilter)}
    `;

    // Get inventory stats
    const inventoryStats = await sql`
      SELECT 
        COUNT(*) as total_medicines,
        COUNT(CASE WHEN stock <= min_stock THEN 1 END) as low_stock_count,
        COUNT(CASE WHEN expiry_date <= CURRENT_DATE + INTERVAL '3 months' THEN 1 END) as expiring_soon_count,
        COALESCE(SUM(stock * cost_price), 0) as total_inventory_value
      FROM medicines
    `;

    // Get customer stats
    const customerStats = await sql`
      SELECT 
        COUNT(DISTINCT customer_id) as active_customers,
        COUNT(*) as total_customers
      FROM (
        SELECT customer_id FROM sales WHERE ${sql.raw(dateFilter)}
        UNION
        SELECT id as customer_id FROM customers
      ) AS combined_customers
    `;

    // Get prescription stats
    const prescriptionStats = await sql`
      SELECT 
        COUNT(*) as total_prescriptions,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_prescriptions,
        COUNT(CASE WHEN status = 'fulfilled' THEN 1 END) as fulfilled_prescriptions
      FROM prescriptions 
      WHERE ${sql.raw(dateFilter)}
    `;

    // Get top selling medicines
    const topMedicines = await sql`
      SELECT 
        m.name, m.brand, m.category,
        SUM(si.quantity) as total_sold,
        SUM(si.total_price) as total_revenue
      FROM sale_items si
      JOIN medicines m ON si.medicine_id = m.id
      JOIN sales s ON si.sale_id = s.id
      WHERE ${sql.raw(dateFilter.replace('created_at', 's.created_at'))}
      GROUP BY m.id, m.name, m.brand, m.category
      ORDER BY total_sold DESC
      LIMIT 10
    `;

    // Get daily sales trend (last 7 days)
    const salesTrend = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as sales_count,
        COALESCE(SUM(final_amount), 0) as daily_revenue
      FROM sales 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    // Get category-wise sales
    const categorySales = await sql`
      SELECT 
        m.category,
        COUNT(si.id) as item_count,
        SUM(si.total_price) as category_revenue
      FROM sale_items si
      JOIN medicines m ON si.medicine_id = m.id
      JOIN sales s ON si.sale_id = s.id
      WHERE ${sql.raw(dateFilter.replace('created_at', 's.created_at'))}
      GROUP BY m.category
      ORDER BY category_revenue DESC
    `;

    // Get payment method breakdown
    const paymentMethods = await sql`
      SELECT 
        payment_method,
        COUNT(*) as transaction_count,
        SUM(final_amount) as total_amount
      FROM sales 
      WHERE ${sql.raw(dateFilter)}
      GROUP BY payment_method
      ORDER BY transaction_count DESC
    `;

    return Response.json({
      period,
      sales: salesStats[0],
      inventory: inventoryStats[0],
      customers: customerStats[0],
      prescriptions: prescriptionStats[0],
      top_medicines: topMedicines,
      sales_trend: salesTrend,
      category_sales: categorySales,
      payment_methods: paymentMethods
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return Response.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}