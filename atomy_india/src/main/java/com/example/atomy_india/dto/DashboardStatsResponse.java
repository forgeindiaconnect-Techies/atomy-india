package com.example.atomy_india.dto;

import com.example.atomy_india.model.CustomerOrder;
import java.math.BigDecimal;
import java.util.List;

public class DashboardStatsResponse {
    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private long todayOrders;
    private long totalOrders;
    private long pendingOrders;
    private long shippedOrders;
    private long deliveredOrders;
    private long lowStockCount;
    private long outOfStockCount;
    private long openTicketsCount;
    private List<CustomerOrder> recentOrders;

    public DashboardStatsResponse() {}

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public BigDecimal getTodayRevenue() { return todayRevenue; }
    public void setTodayRevenue(BigDecimal todayRevenue) { this.todayRevenue = todayRevenue; }

    public long getTodayOrders() { return todayOrders; }
    public void setTodayOrders(long todayOrders) { this.todayOrders = todayOrders; }

    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

    public long getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(long pendingOrders) { this.pendingOrders = pendingOrders; }

    public long getShippedOrders() { return shippedOrders; }
    public void setShippedOrders(long shippedOrders) { this.shippedOrders = shippedOrders; }

    public long getDeliveredOrders() { return deliveredOrders; }
    public void setDeliveredOrders(long deliveredOrders) { this.deliveredOrders = deliveredOrders; }

    public long getLowStockCount() { return lowStockCount; }
    public void setLowStockCount(long lowStockCount) { this.lowStockCount = lowStockCount; }

    public long getOutOfStockCount() { return outOfStockCount; }
    public void setOutOfStockCount(long outOfStockCount) { this.outOfStockCount = outOfStockCount; }

    public long getOpenTicketsCount() { return openTicketsCount; }
    public void setOpenTicketsCount(long openTicketsCount) { this.openTicketsCount = openTicketsCount; }

    public List<CustomerOrder> getRecentOrders() { return recentOrders; }
    public void setRecentOrders(List<CustomerOrder> recentOrders) { this.recentOrders = recentOrders; }
}
