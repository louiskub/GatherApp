const actTypeArr = [
    "Running", "Swimming", "Cycling", "Hiking", "Yoga", "Dancing", "Weightlifting", "Boxing", "Martial Arts", "Rock Climbing",
    "Kayaking", "Canoeing", "Rowing", "Sailing", "Surfing", "Windsurfing", "Kitesurfing", "Paddleboarding", "Snorkeling", "Scuba Diving"
];
async function createActType() {
    actTypeArr.forEach(async (actType) => {
        console.log(actType);
        await fetch(`http://localhost:5174/api/actType/${actType}`, {
            method: 'POST'
        })
    })
}


async function creteUser(){
    const randomSex = () => Math.random() < 0.5 ? "Male" : "Female";
    const randImg = "https://picsum.photos/200"
    const firstNames = ["John", "Jane", "Alex", "Emily", "Chris", "Katie", "Michael", "Sarah", "David", "Laura", "James", "Emma", "Robert", "Olivia", "Daniel", "Sophia", "Matthew", "Isabella", "Andrew", "Mia"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
    for(let i=1; i<=19; i++){
        await fetch(`http://localhost:5174/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: `user${i}`,
                email: `user${i}@gmail.com`,
                firstName: firstNames[i-1],
                lastName: lastNames[i-1],
                dateOfBirth: `20${(i%10)+10}-03-${i+10}T14:${(i+10)*2}:00`,
                password: "User123!",
                sex: randomSex()
            })
        })
        .then(async(res) => {
            let data = await res.json()
            const randomActType = actTypeArr[Math.floor(Math.random() * actTypeArr.length)];
            await fetch(`http://localhost:5174/api/user/myprofile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${data.token}`
                },
                body: JSON.stringify({
                    bio: `I'm user ${i}`,
                    profileImg: `${randImg}${i}`,
                    actTypeProfile : [randomActType]
                })
            })
        })
    }
}


async function main() {
    await createActType();
    await creteUser();
}

main();
