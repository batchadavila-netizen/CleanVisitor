namespace CleanVisitor.Application.Features.Visitors.Dtos.StatMoisDto;
public class StatMoisDto{
    public int Mois{get;set;}
    public int TotalVisitor{get; set;}
    public string NomMois => new System.Globalization.DateTimeFormatInfo().GetMonthName(Mois);
}