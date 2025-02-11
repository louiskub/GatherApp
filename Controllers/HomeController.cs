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
        return View();
    }

    [Route("aboutus")]
    public IActionResult AboutUs()
    {
        return View("~/Views/Home/AboutUs.cshtml");
    }

    [Route("history")]
    public IActionResult History()
    {
        return View("~/Views/Home/History.cshtml");
    }

    [Route("post")]
    public IActionResult ViewPost()
    {
        return View("~/Views/Home/Viewpost.cshtml");
    }

    [Route("profile")]
    public IActionResult ViewProfile()
    {
        return View("~/Views/Home/Profile.cshtml");
    }

    [Route("login")]
    public IActionResult Login()
    {
        return View("~/Views/Auth/Login.cshtml");
    }

    [Route("signup")]
    public IActionResult SignUp()
    {
        return View("~/Views/Auth/SignUp.cshtml");
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
