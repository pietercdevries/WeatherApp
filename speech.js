window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;

let text = "";

recognition.addEventListener("result", (e) =>
{
	text = Array.from(e.results)
	                  .map((result) => result[0])
	                  .map((result) => result.transcript)
	                  .join("");
	
	if (e.results[0].isFinal)
	{
		console.log(text);
		
		if (text.includes("you") || text.includes("elon") || text.includes("Elon") || text.includes("elan") || text.includes("Elan") || text.includes("alon") || text.includes("Alon"))
		{
			if (text.includes("time"))
			{
				$("#message").val("It's " + $('#time').html());
				
				text = "";
			}
			else if (text.includes("date"))
			{
				$("#message").val("It's " + $('#date').html());
				
				text = "";
			}
			else if (text.includes("temperature"))
			{
				$("#message").val("It's " + $('#temperature').html() + " Fahrenheit");
				
				text = "";
			}
			else if (text.includes("weather"))
			{
				$("#message").val("It's " + $('#temperature').html() + " Fahrenheit");
				
				text = "";
			}
			else if (text.includes("wind") && text.includes("speed"))
			{
				$("#message").val("The wind speed is " + $('.windspeed').html());
				
				text = "";
			}
			else if (text.includes("pressure"))
			{
				$("#message").val("The air pressure is " + $('.pressure').html().replaceAll(" hPa", "") + " pascal");
				
				text = "";
			}
			else if (text.includes("humidity"))
			{
				$("#message").val("The humidity is " + $('.humidity').html());
				
				text = "";
			}
			else if (text.includes("aqi") || text.includes("air") || text.includes("quality"))
			{
				$.getJSON("https://api.waqi.info/feed/grants%20pass/?token=14a9d611a3e0a2ca8e55a44d73fa5541970a3020", function(json)
				{
					let aqi = JSON.stringify(json.data.aqi);
					$("#message").val("The air quality is " + getAQIText(aqi) + " at " + aqi);
				});
				
				text = "";
			}
			else
			{
				$("#message").val("");
				text = "";
			}
		}
	}
});

let speech;

$("#speakButton").on("click", function ()
{
	speech = new SpeechSynthesisUtterance();
	$("#speakButton").hide();
	
	recognition.addEventListener("end", () =>
	{
		speech.text = $("#message").val();
		speech.volume = 1;
		speech.rate = 1;
		speech.pitch = 1;
		
		window.speechSynthesis.speak(speech);
		
		recognition.start();
		
		text = "";
		$("#message").val("");
	});
	
	speech.addEventListener('start', function(event)
	{
		recognition.stop();
	});
	
	speech.addEventListener('end', function(event)
	{
		recognition.start();
	});
	
	recognition.start();
});

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