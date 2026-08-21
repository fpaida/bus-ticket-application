const buses = [
    {
        bus: "RE101",
        from: "Houston",
        destination: "Dallas",
        departure: "08:00 AM",
        arrival: "12:00 PM",
        price: "$45"
    },
    {
        bus: "RE102",
        from: "Houston",
        destination: "Austin",
        departure: "09:30 AM",
        arrival: "12:30 PM",
        price: "$35"
    },
    {
        bus: "RE103",
        from: "Houston",
        destination: "San Antonio",
        departure: "11:00 AM",
        arrival: "02:30 PM",
        price: "$40"
    },
    {
        bus: "RE104",
        from: "Houston",
        destination: "New Orleans",
        departure: "01:00 PM",
        arrival: "07:00 PM",
        price: "$55"
    }
];

function displaySchedule(data) {

    const table = document.getElementById("schedule");
    table.innerHTML = "";

    data.forEach(bus => {

        const row = `
        <tr>
            <td>${bus.bus}</td>
            <td>${bus.from}</td>
            <td>${bus.destination}</td>
            <td>${bus.departure}</td>
            <td>${bus.arrival}</td>
            <td>${bus.price}</td>
            <td>
                <button onclick="purchaseTicket('${bus.bus}')">
                    Purchase Ticket
                </button>
            </td>
        </tr>
        `;

        table.innerHTML += row;
    });
}

function searchBus() {

    const destination =
        document.getElementById("destination").value;

    if (destination === "all") {
        displaySchedule(buses);
        return;
    }

    const filtered =
        buses.filter(bus =>
            bus.destination === destination
        );

    displaySchedule(filtered);
}

function purchaseTicket(busNumber) {

    alert(
        "Ticket purchase started for Bus " +
        busNumber +
        ". Payment integration will be added in a future release."
    );
}

displaySchedule(buses);
