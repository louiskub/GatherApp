using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using GatherApp.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

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

    [Route("history/likes")]
    [Authorize]
    public IActionResult LikesPost()
    {
        ViewBag.IsAuthorized = User.Identity?.IsAuthenticated ?? false;
        return View("~/Views/Home/LikesPost.cshtml");
    }

    [Route("history/post")]
    [Authorize]
    public IActionResult PostHistory()
    {
        ViewBag.IsAuthorized = User.Identity?.IsAuthenticated ?? false;
        return View("~/Views/Home/History/PostHistory.cshtml");
    }

    [Route("history/application")]
    [Authorize]
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
    
    [Route("report")]
    [Authorize]
    public IActionResult Report()
    {
        ViewBag.IsAuthorized = User.Identity?.IsAuthenticated ?? false;
        return View("~/Views/Home/Report.cshtml");
    }

    [Route("review")]
    [Authorize]
    public IActionResult Review()
    {
        ViewBag.IsAuthorized = User.Identity?.IsAuthenticated ?? false;
        return View("~/Views/Home/Review.cshtml");
    }

    [Route("login")]
    public IActionResult Login()
    {
        ViewBag.IsAuthorized = User.Identity?.IsAuthenticated ?? false;
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId != null)
            return RedirectToAction("Index", "Home");
        return View("~/Views/Auth/Login2.cshtml");
    }

    [Route("signup")]
    public IActionResult SignUp()
    {
        ViewBag.IsAuthorized = User.Identity?.IsAuthenticated ?? false;
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId != null)
            return RedirectToAction("Index", "Home");
        return View("~/Views/Auth/SignUp2.cshtml");
    }

    [Route("Chat")]
    [Authorize]
    public IActionResult Chat()
    {
        ViewBag.IsAuthorized = User.Identity?.IsAuthenticated ?? false;
        return View("~/Views/Home/ChatHub.cshtml");
    }

    [Route("GlobalChat")]
    [Authorize]
    public IActionResult GlobalChat()
    {
        ViewBag.IsAuthorized = User.Identity?.IsAuthenticated ?? false;
        return View("~/Views/Home/GlobalChathub.cshtml");
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = System.Diagnostics.Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }

}
