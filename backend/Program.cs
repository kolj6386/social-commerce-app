using backend.Data;
using backend.Interfaces;
using backend.Middleware;
using backend.Repository;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();
// Enable Console Logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "Demo API", Version = "v1" });
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            new string[]{}
        }
    });
});

// Setting up our database for use. 
builder.Services.AddDbContext<ApplicationDBContext>(options => 
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Wiring up the services 
builder.Services.AddScoped<IPostRepository, PostRepository>();
builder.Services.AddScoped<IReactionRepository, ReactionRepository>();
builder.Services.AddScoped<ICommentRepository, CommentRepository>();
builder.Services.AddHttpContextAccessor();
//singleton - only version will ever exist
//scoped - one version per request
//transient - one version per time the class is injected

builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll",
    policy => {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowAll");
// Confirm CORS headers
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
    context.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");
    await next.Invoke();
});

// Handle preflight requests
app.Use(async (context, next) =>
{
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.StatusCode = 200;
        await context.Response.CompleteAsync();
        return;
    }
    await next.Invoke();
});


app.UseRouting();
app.UseHttpsRedirection();
// app.UseMiddleware<backend.Middleware.JwtAuthMiddleware>();
app.UseWhen(context => context.Request.Path.StartsWithSegments("/admin"), adminRoute => {
    adminRoute.UseMiddleware<JwtAuthMiddleware>();
});
app.MapControllers();
app.UseEndpoints(endpoints => { endpoints.MapControllers(); });

app.Run();