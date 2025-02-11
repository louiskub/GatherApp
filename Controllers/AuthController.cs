using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using GatherApp.Models;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;

namespace GatherApp.Controllers;

public class AuthController : Controller
{
    [HttpPost]
    [Route("login")]
    public IActionResult Login()
    {
        return View();
    }


}