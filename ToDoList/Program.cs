using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using ToDoList;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Enadle us to load database nested opjects, without going into infinite loops.
builder.Services.AddControllers().AddJsonOptions(options => { options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles; });
builder.Services.AddDbContext<TodoContext>(opt => opt.UseSqlite("DataSource=todo.db"));

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
