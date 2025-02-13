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

    [Route("home/unauth")]
    public IActionResult HomeUnAuth()
    {
        return View("~/Views/Home/HomeUnAuth.cshtml");
    }

    [Route("home/auth")]
    public IActionResult HomeAuth()
    {
        return View("~/Views/Home/HomeAuth.cshtml");
    }

    // [Route("nav")]
    // public IActionResult Nav()
    // {
    //     return View("~/Views/Navbar/NavAuth.cshtml");
    // }

    [Route("aboutus")]
    public IActionResult AboutUs()
    {
        return View("~/Views/Home/AboutUs.cshtml");
    }

    [Route("history/post")]
    public IActionResult PostHistory()
    {
        return View("~/Views/Home/PostHistory.cshtml");
    }

    [Route("history/application")]
    public IActionResult ApplicationHistory()
    {
        return View("~/Views/Home/ApplicationHistory.cshtml");
    }

    [Route("post")]
    public IActionResult ViewPost()
    {
        return View("~/Views/Home/ViewPost.cshtml");
    }

    [Route("profile")]
    public IActionResult ViewProfile()
    {
        return View("~/Views/Home/ViewProfile.cshtml");
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
