namespace CleanVisitor.Application.Features.SystemConfigs.Dtos;

public class SystemConfigDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public int PassValidityHours { get; set; }
    public int MaxConcurrentVisitors { get; set; }
    public int AutoExpireHours { get; set; }
    public bool EnableEmailNotifs { get; set; }
    public List<string> CompanyServices { get; set; } = new();
}