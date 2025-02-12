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

    [Route("nav")]
    public IActionResult Nav()
    {
        return View("~/Views/Navbar/NavAuth.cshtml");
    }

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
        return View(new ErrorViewModel { RequestId = System.Diagnostics.Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }

        [Route("download")]
    public IActionResult GetFile()
    {
        var content = Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAZFJREFUeF7tW0EOQTEQbZduQOIEElsOwh1sWLoIq7+wtsBB2EpcgVt8qSDy0aem8k37/koynf7Omzdv+tOyBjzltleiMT677e+sxP/XvnBxBIAMYAlQAyRCRBFkF/jzNihtc5LycL51l4glAB/2edvfmXLbuyT88Xc2DMgeAGmm3/mr0QAy4Fr7LpM3LYjBCjUMiBHsqzlqB6C6qMmm6937zwd77yd0c1iIvh1O65F3ftS2QwF9ehkBIAMyKwFEeSR+q+UYDRHZj9OFyB9pgv01AMfD6B5Aq1MEB5MEAC5wB0S2ALi0fxO88yMDtGtAcNFXHNQzgAAIESADqAHKN0LCCtDfBv8eAOkCtfvD+wHaA0TrJwAIodTtZEDqGUbxkQEIodTtZEDqGUbxkQEIodTtZEDqGUbxkQEIodTt0RmAjtrQ/YLY5/8ogQQAIRRqJwOEFyzUlQDKOGLQrN1AQ7x2dP6PJhdrAAEAlEcZIANYAtQAVCUUQR8C7ALCP2WxDYoK0BjDfQD3Af67xYhhdW+EziMSO1DMcr4NAAAAAElFTkSuQmCC");
        return File(content, "application/octet-stream", "image.png");
    }
}
