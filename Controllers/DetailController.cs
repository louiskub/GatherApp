using Microsoft.AspNetCore.Mvc;

namespace GatherApp.Controllers;
public class DetailController : Controller
{
    public IActionResult Index()
    {
       return View();
    }
    public IActionResult Tables()
    {
        return View();
    }
    public IActionResult Show(int id)
    {
        return Content($"(ผู้เข้าร่วมคนที่ {id})");
    }
}
