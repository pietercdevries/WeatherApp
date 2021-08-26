window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;

let text = "";
let listen = false;
let listening = null;
let i = 0;
let txt = "";
let speed = 120;

recognition.addEventListener("result", (e) =>
{
	text = Array.from(e.results)
	                  .map((result) => result[0])
	                  .map((result) => result.transcript)
	                  .join("");
	
	if (e.results[0].isFinal)
	{
		if (text.includes("you") || text.includes("elon") || text.includes("Elon") || text.includes("elan") || text.includes("Elan") || text.includes("alon") || text.includes("Alon")|| text.includes("Yvonne"))
		{
			if (listening != null)
			{
				clearInterval(listening);
			}
			
			$("#messageBubble").html("");
			$("#teslaBot").show();
			$(".widget-container").css("filter", "blur(5px)");
			
			listen = true;
			
			listening = setTimeout(function ()
			{
				listen = false;
				$("#teslaBot").hide();
				$(".widget-container").css("filter", "unset");
			}, 6000);
		}
		
		if (listen === true)
		{
			if (text.includes("time"))
			{
				$("#message").val("It's " + $('#time').html());
			}
			else if (text.includes("date"))
			{
				$("#message").val("It's " + $('#date').html());
			}
			else if (text.includes("temperature"))
			{
				$("#message").val("It's " + $('#temperature').html() + " Fahrenheit");
			}
			else if (text.includes("weather"))
			{
				$("#message").val("It's " + $('#temperature').html() + " Fahrenheit");
			}
			else if (text.includes("wind") && text.includes("speed"))
			{
				$("#message").val("The wind speed is " + $('.windspeed').html());
			}
			else if (text.includes("pressure"))
			{
				$("#message").val("The air pressure is " + $('.pressure').html().replaceAll(" hPa", "") + " pascal");
			}
			else if (text.includes("humidity"))
			{
				$("#message").val("The humidity is " + $('.humidity').html());
			}
			else if (text.includes("aqi") || text.includes("air") || text.includes("quality"))
			{
				$.getJSON("https://api.waqi.info/feed/grants%20pass/?token=14a9d611a3e0a2ca8e55a44d73fa5541970a3020", function(json)
				{
					let aqi = JSON.stringify(json.data.aqi);
					$("#message").val("The air quality is " + getAQIText(aqi) + " at " + aqi);
				});
			}
			else
			{
				$("#message").val("");
				text = "";
			}
		}
	}
});

recognition.start();

recognition.addEventListener("end", () =>
{
	responsiveVoice.speak($("#message").val(), "UK English Male");
	
	recognition.start();
	
	if (text !== "" && text !== " " && listen === true)
	{
		i = 0;
		txt = $("#message").val();
		$("#messageBubble").show();
		typeWriter();
		resetSpeech();
	}
	
	text = "";
	$("#message").val("");
});

function resetSpeech()
{
	text = "";
	listen = false;
}

function getAQIText(aqi)
{
	let name = "";
	
	if (aqi <= 50)
	{
		name = "Good";
	}
	else if (aqi > 50 && aqi <= 100)
	{
		name = "Moderate";
	}
	else if (aqi > 100 && aqi <= 150)
	{
		name = "Unhealthy for sensitive groups";
	}
	else if (aqi > 150 && aqi <= 200)
	{
		name = "Unhealthy";
	}
	else if (aqi > 200 && aqi <= 500)
	{
		name = "Very Unhealthy";
	}
	else if (aqi > 500)
	{
		name = "Hazardous";
	}
	
	return name;
}

function typeWriter()
{
	if (i < txt.length)
	{
		document.getElementById("messageBubble").innerHTML += txt.charAt(i);
		i++;
		setTimeout(typeWriter, speed);
	}
	else
	{
		setTimeout(function ()
		{
			$("#messageBubble").hide();
			
			i = 0;
			txt = "";
		}, 1000);
	}
}
