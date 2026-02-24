using CleanVisitor.Core.Entities.User;
public record AuthenticationResponse(User user, string Token);