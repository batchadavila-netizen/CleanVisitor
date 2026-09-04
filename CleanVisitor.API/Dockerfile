FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["CleanVisitor.API/CleanVisitor.API.csproj", "CleanVisitor.API/"]
COPY ["CleanVisitor.Application/CleanVisitor.Application.csproj", "CleanVisitor.Application/"]
COPY ["CleanVisitor.Infrastructure/CleanVisitor.Infrastructure.csproj", "CleanVisitor.Infrastructure/"]
COPY ["CleanVisitor.Core/CleanVisitor.Core.csproj", "CleanVisitor.Core/"]
RUN dotnet restore "CleanVisitor.API/CleanVisitor.API.csproj"
COPY . .
WORKDIR "/src/CleanVisitor.API"
RUN dotnet publish "CleanVisitor.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "CleanVisitor.API.dll"]