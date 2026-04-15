namespace CleanVisitor.Application.DTOs.Dashboard;

public class DashboardStatsDto
{
    public VisitStatsDto Visits { get; set; } = new();
    public VisitorStatsDto Visitors { get; set; } = new();
    public int Pending { get; set; }
}

public class VisitStatsDto
{
    public int Day { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
}

public class VisitorStatsDto
{
    public int Day { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
}