using MediatR;
using CleanVisitor.Core.Entities;
using CleanVisitor.Application.Features.Visitors.Dtos;
using System;
namespace CleanVisitor.Application.Features.Visitors.Commande.DeleteVisitor;
public record DeleteVisitorCommand : IRequest<bool>
{
    public int Id;
    public DeleteVisitorCommand(int id)
    {
        Id=id;
    }
}