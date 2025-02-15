using Microsoft.EntityFrameworkCore;
using Serilog;
using System.Text.Json.Serialization;
using ToDoList;
using ToDoList.Services;
using Microsoft.Extensions.Logging;

var builder = WebApplication.CreateBuilder(args);
DotNetEnv.Env.Load();
string dbVariable = Environment.GetEnvironmentVariable("SQLite_SRC");
// Add services to the container.

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console() // Still logs to the console
    .WriteTo.File("Logs/app.log", rollingInterval: RollingInterval.Day) // Logs to a file daily
    .CreateLogger();
builder.Host.UseSerilog(); // Use Serilog instead of default logging

builder.Services.AddControllers();
// Enadle us to load database nested opjects, without going into infinite loops.
builder.Services.AddControllers().AddJsonOptions(options => options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);
// set to SplitQuery as opposed to SingleQuery which is the default
builder.Services.AddDbContext<TodoContext>(opt => opt.UseSqlite(dbVariable, sqliteOptions => {
                                sqliteOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
                            }));
builder.Services.AddScoped<ProjectService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var sitePolicy = "site-policy";
builder.Services.AddCors(options =>
{
    options.AddPolicy(sitePolicy, builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyHeader()
               .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors(sitePolicy);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
