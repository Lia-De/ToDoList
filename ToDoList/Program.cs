using Microsoft.EntityFrameworkCore;
using Serilog;
using System.Text.Json.Serialization;
using ToDoList;
using ToDoList.Services;
using Microsoft.Extensions.Logging;
using ToDoList.Models;
using Microsoft.Extensions.Configuration;
using System;
using DotNetEnv;
using Microsoft.EntityFrameworkCore.SqlServer;
using Microsoft.Data.SqlClient;
using Azure.Identity;

var builder = WebApplication.CreateBuilder(args);
DotNetEnv.Env.Load();

string connectionString = Environment.GetEnvironmentVariable("AZURE_SQL_CONNECTIONSTRING")!;

if (string.IsNullOrEmpty(connectionString))
{
    throw new Exception("Database connection string is missing. Check your .env file.");
}
// Add services to the container.

Log.Logger = new LoggerConfiguration()
    //.WriteTo.Console() // Still logs to the console
    .WriteTo.File("Logs/app.log", rollingInterval: RollingInterval.Day) // Logs to a file daily
    .CreateLogger();
builder.Host.UseSerilog(); // Use Serilog instead of default logging

builder.Services.AddControllers();
// Enadle us to load database nested opjects, without going into infinite loops.
builder.Services.AddControllers().AddJsonOptions(options => options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);


builder.Services.AddDbContext<TodoContext>(options =>
    options.UseSqlServer(connectionString));


builder.Services.AddScoped<ProjectService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Ensure the database is created
using var scope = app.Services.CreateScope();
var dbContext = scope.ServiceProvider.GetRequiredService<TodoContext>();
dbContext.Database.EnsureCreated();


app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
