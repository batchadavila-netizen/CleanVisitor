namespace CleanVisitor.Core.Entities.Notification;
public class Notification {
    public int Id { get; set; }
    public string Message { get; set; }
    public DateTime DateEnvoi { get; set; } = DateTime.Now;
    public bool IsRead { get; set; } = false;
    public int IdVisitor { get; set; } 
    public string ReceiverRole { get; set; }
    public string Type { get; set; } 
}