export default function imgSelection(img, failed="https://tr.rbxcdn.com/30DAY-Avatar-310966282D3529E36976BF6B07B1DC90-Png/352/352/Avatar/Png/noFilter"){
    if (img == "" || img == null) 
        return failed
    else if(img.length < 200) 
        return img
    else 
        return "data:image/jpeg;base64," + img
}