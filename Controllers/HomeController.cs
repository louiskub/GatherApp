using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using GatherApp.Models;

namespace GatherApp.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    public IActionResult Index()
    {
        ViewBag.IsAuthorized = User.Identity?.IsAuthenticated ?? false;
        return View();
    }

    [Route("search")]
    public IActionResult Search()
    {
        ViewBag.IsAuthorized = User.Identity?.IsAuthenticated ?? false;
        return View("~/Views/Home/Search.cshtml");
    }

    [Route("aboutus")]
    public IActionResult AboutUs()
    {
        ViewBag.IsAuthorized = User.Identity?.IsAuthenticated ?? false;
        return View("~/Views/Home/AboutUs.cshtml");
    }

    [Route("history/post")]
    public IActionResult PostHistory()
    {
        ViewBag.IsAuthorized = User.Identity?.IsAuthenticated ?? false;
        return View("~/Views/Home/History/PostHistory.cshtml");
    }

    [Route("history/application")]
    public IActionResult ApplicationHistory()
    {
        ViewBag.IsAuthorized = User.Identity?.IsAuthenticated ?? false;
        return View("~/Views/Home/History/ApplicationHistory.cshtml");
    }

    [Route("post")]
    public IActionResult ViewPost()
    {
        ViewBag.IsAuthorized = User.Identity?.IsAuthenticated ?? false;
        return View("~/Views/Home/ViewPost.cshtml");
    }

    [Route("profile")]
    public IActionResult ViewProfile()
    {
        ViewBag.IsAuthorized = User.Identity?.IsAuthenticated ?? false;
        return View("~/Views/Home/ViewProfile.cshtml");
    }

    [Route("login")]
    public IActionResult Login()
    {
        ViewBag.IsAuthorized = User.Identity?.IsAuthenticated ?? false;
        return View("~/Views/Auth/Login.cshtml");
    }

    [Route("signup")]
    public IActionResult SignUp()
    {
        ViewBag.IsAuthorized = User.Identity?.IsAuthenticated ?? false;
        return View("~/Views/Auth/SignUp.cshtml");
    }

    [Route("Chat")]

    public IActionResult Chat()
    {
        ViewBag.IsAuthorized = User.Identity?.IsAuthenticated ?? false;
        return View("~/Views/Home/ChatHub.cshtml");
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = System.Diagnostics.Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }

}
