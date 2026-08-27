namespace CleanVisitor.Core.Entities.SystemConfigs;

public class SystemConfigs
{
    public int Id { get; set; } = 1;
    public string CompanyName { get; set; } = "Davila Entreprise";
    public string ContactEmail { get; set; } = "contact@davila.com";
    public int PassValidityHours { get; set; } = 2;
    public int MaxConcurrentVisitors { get; set; } = 50;
    public int AutoExpireHours { get; set; } = 24;
    public bool EnableEmailNotifs { get; set; } = true;
    public List<string> CompanyServices { get; set; } = new();
}