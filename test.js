(function() {
    const scriptId = "aq-dial-script";
    let baseWidgetURL;
    let jQuery;
    let version = "0.1";

    loadJQuery(main);

    function loadJQuery(callback) {
        if (window.jQuery === undefined) {
            let script_tag = document.createElement('script');
            script_tag.setAttribute("type","text/javascript");
            script_tag.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js");
            if (script_tag.readyState) {
                script_tag.onreadystatechange = function () {
                    // For old versions of IE
                    if (this.readyState === 'complete' || this.readyState === 'loaded') {
                        scriptLoadHandler();
                    }
                };
            } else {
                // Other browsers
                script_tag.onload = scriptLoadHandler;
            }
            (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
        } else {
            jQuery = window.jQuery;
            callback(); //our main JS functionality
        }

        function scriptLoadHandler() {
            jQuery = window.jQuery.noConflict(false);
            callback(); //main JS functionality
        }
    }

    function main() {
        jQuery(document).ready(function() {
            baseWidgetURL = document.getElementById(scriptId).src;
            baseWidgetURL = baseWidgetURL.slice(0, baseWidgetURL.length-17); // Remove "aq-dial-widget.js", which is 17 characters long

            loadCSS();
            loadJS();

        });
    }


    function loadCSS() {
        jQuery("head").prepend(
            "<style type=\"text/css\">" +
            "    @font-face {\n" +
            "        font-family: AQDialWidget-DroidSansFont;\n" +
            "        src: url('"+baseWidgetURL+"css/DroidSans-webfont.ttf'),\n" +
            "            url('"+baseWidgetURL+"css/DroidSans-webfont.eot');\n" +
            "        font-weight: normal;\n" +
            "        font-style: normal;\n" +
            "    }\n" +
            "</style>"
        );

        jQuery("<link>", {
            rel: "stylesheet",
            type: "text/css",
            href: baseWidgetURL + "css/style.css?v=" + version
        }).appendTo('head');
    }

    function loadJS() {
        jQuery.getScript("//cdnjs.cloudflare.com/ajax/libs/moment.js/2.20.1/moment-with-locales.js", function() {
            jQuery.getScript(baseWidgetURL + "js/base.js", function() {
                jQuery.getScript(baseWidgetURL + "js/pubsub.js", function() {
                    jQuery.getScript(baseWidgetURL + "js/storage.js", function() {
                        jQuery.getScript(baseWidgetURL + "js/geolocation.js", function() {
                            jQuery.getScript(baseWidgetURL + "js/reportingarea.js", function() {
                                loadTemplate();
                                loadData();
                            });
                        });
                    });
                });
            });
        });
    }

    function loadTemplate() {
        jQuery(".aq-dial-widget").html(template_html)
        //jQuery(".aq-dial-background").attr("src", baseWidgetURL + "images/dial_black_circle_top.svg");
        //jQuery(".aq-dial-background2").attr("src", baseWidgetURL + "images/dial_black_circle_bottom.svg");
        //jQuery(".aq-dial-meter").attr("src", baseWidgetURL + "images/dial_legend.svg");
        //jQuery(".aq-dial-arrow").attr("src", baseWidgetURL + "images/dial_arrow_full_rounded.svg");
        //jQuery(".aq-dial-status").attr("src", baseWidgetURL + "images/dial_not_available.svg");
    }

    //const MAX_ROTATION_DEGREES = 180;
    //const MIN_ROTATION_DEGREES = 0;
    let AQDialWidget;
    let ReportingArea;
    let GeoLocation;
    // Allow URL to determine type of data to display cw 2020-06-15
    let currentDataType = "today";
    if ( window.location.href.includes("a=") ) {
        currentDataType = urlParam("a");
    }
    //console.log(currentDataType);

    function loadData() {
        AQDialWidget = window.AQDialWidget;
        ReportingArea = AQDialWidget.ReportingArea;
        GeoLocation = AQDialWidget.GeoLocation;

        PubSub.subscribe(ReportingArea.TOPICS.new_data, function() {
            populateData();
        });

        // Check and Allow use of zip Code cw 2020-06-08
        if ( window.location.href.includes("z=") ) {
            // use zip lookup
            let zip = urlParam("z"); //console.log(zip);

            GeoLocation.lookupLocationByZip(zip, false);
            //console.log(GeoLocation.cityName);
            //GeoLocation.lookupLocationByCityStateCountry(city, state, country, false);
        } else {
            // use City, State, country
            let city = urlParam("city"); //console.log(city);
            let state = urlParam("state");
            let country = urlParam("country");

            GeoLocation.lookupLocationByCityStateCountry(city, state, country, false);
        }

    }

    function populateData() {
        let locationDisplayName = GeoLocation.getLocationDisplayName();

        let aqData = ReportingArea.getMaxCurrentReportingAreaData();
        let currentData = ReportingArea.getAllCurrentReportingAreaData();
        let fcstTodayData = ReportingArea.getMaxForecastReportingAreaData(0);
        let fcstTodayDataOther = ReportingArea.getOtherForecastReportingAreaData(0);
        let fcstTomorrowData = ReportingArea.getMaxForecastReportingAreaData(1);
        let fcstTomorrowDataOther = ReportingArea.getOtherForecastReportingAreaData(1);

        let hasData = aqData;

        // AIR-430 NA is the default flag and pollutant Dot cw 2021-06-28
        var imageDot = document.getElementById('poll_dot');
        imageDot.src = "/aq-flag-widget/images/NA-dot.png";
        var image = document.getElementById('flag');
        image.src = "/aq-flag-widget/images/NA-flag.png";

        if (hasData) {
            //console.log(currentDataType === 'today' && fcstTodayData);
            if (currentDataType === 'today' && fcstTodayData) {

                let category = fcstTodayData[ReportingArea.FIELDS.category];
                //let day = "Today";
                // Converted to Flag Progam Widget style cw 2020-06-11

                // Custom Name label cw 2020-06-12
                var name = document.getElementById('custom-location-name');
                name.innerHTML = "<strong>"+ decodeURI(urlParam("n")) +"</strong>";
                // Target the flag graphic cw 2020-06-11
                //image = document.getElementById('flag');
                let flagColor = categoryColor(fcstTodayData[ReportingArea.FIELDS.category]);
                image.src = "/aq-flag-widget/images/"+flagColor+"-flag.png";
                // Target the Middle Text Section cw 2020-06-12
                // old format: <b>Today\'s Air Quality <br>Forecast<br> 6/8/2020  <br></b>
                var middleText = document.getElementById('middleText');
                let date = fcstTodayData[ReportingArea.FIELDS.validDate];
                middleText.innerHTML = "<strong>"+currentDataType.charAt(0).toUpperCase() + currentDataType.slice(1)+"\'s Air Quality <br>Forecast<br> "+ date +"  <br>";
                // Target the Pollutant Section cw 2020-06-16
                // First / Highest Pollutant
                var poll_name = document.getElementById('poll_name');
                //console.log(fcstTodayData);
                //console.log(fcstTodayData[ReportingArea.FIELDS.parameter]);
                //console.log(fcstTodayData[ReportingArea.FIELDS.aqi]);
                //console.log(fcstTodayData[ReportingArea.FIELDS.category]);
                poll_name.innerHTML = fcstTodayData[ReportingArea.FIELDS.parameter];
                let dotColor = categoryColor(fcstTodayData[ReportingArea.FIELDS.category]);
                imageDot.src = "/aq-flag-widget/images/"+dotColor+"-dot.png";
                poll_cat.innerHTML = fcstTodayData[ReportingArea.FIELDS.category];
                // Other Pollutants
                //console.log(fcstTodayDataOther);
                //console.log(fcstTodayDataOther.length);
                let dotColorOther = "green";
                let otherPolls = "";
                for (let i = 0; i < fcstTodayDataOther.length; i++) {
                    //console.log(fcstTodayDataOther[i]);
                    //console.log(fcstTodayDataOther[i][ReportingArea.FIELDS.parameter]);
                    //console.log(fcstTodayDataOther[i][ReportingArea.FIELDS.aqi]);
                    //console.log(fcstTodayDataOther[i][ReportingArea.FIELDS.category]);
                    let dotColorOther = categoryColor(fcstTodayDataOther[i][ReportingArea.FIELDS.category]);
                    // build the entire <TR> each time through the loop cw 2020-06-16
                    eval("otherPoll"+i).innerHTML =
                        '                     <td width="4"></td>' +
                        '                     <td class="style1">'+fcstTodayDataOther[i][ReportingArea.FIELDS.parameter]+'</td>' +
                        '                     <td><img src="images/'+dotColorOther+'-dot.png" /></td>' +
                        '                     <td class="style1">'+fcstTodayDataOther[i][ReportingArea.FIELDS.category]+'</td>';
                } // end for
                // Target the Links cw 2020-06-11
                if ( window.location.href.includes("z=") ) {
                    var leftLink = document.getElementById('leftLink');
                    leftLink.href = "/aq-flag-widget/?a=current&z="+decodeURI(urlParam("z"))+"&n="+decodeURI(urlParam("n"));
                    var rightLink = document.getElementById('rightLink');
                    rightLink.href = "/aq-flag-widget/?a=tomorrow&z="+decodeURI(urlParam("z"))+"&n="+decodeURI(urlParam("n"));
                    rightLink.innerHTML = "Tomorrow\'s Forecast";
                } else if ( window.location.href.includes("city=") ) {
                    var leftLink = document.getElementById('leftLink');
                    leftLink.href = "/aq-flag-widget/?a=current&city="+decodeURI(urlParam("city"))+"&state="+decodeURI(urlParam("state"))+"&country="+decodeURI(urlParam("country"))+"&n="+decodeURI(urlParam("n"));
                    var rightLink = document.getElementById('rightLink');
                    rightLink.href = "/aq-flag-widget/?a=tomorrow&city="+decodeURI(urlParam("city"))+"&state="+decodeURI(urlParam("state"))+"&country="+decodeURI(urlParam("country"))+"&n="+decodeURI(urlParam("n"));
                    rightLink.innerHTML = "Tomorrow\'s Forecast";
                }
            } else if (currentDataType === 'today') {
                // There is NO forecast data for today; keep the Zip and Name cw 2020-07-06
                var leftLink = document.getElementById('leftLink');
                leftLink.href = "/aq-flag-widget/?a=current&z="+decodeURI(urlParam("z"))+"&n="+decodeURI(urlParam("n"));
                var rightLink = document.getElementById('rightLink');
                rightLink.href = "/aq-flag-widget/?a=tomorrow&z="+decodeURI(urlParam("z"))+"&n="+decodeURI(urlParam("n"));
                rightLink.innerHTML = "Tomorrow\'s Forecast";
            }

            if (currentDataType === 'tomorrow' && fcstTomorrowData) {
                let category = fcstTomorrowData[ReportingArea.FIELDS.category];
                // Converted to Flag Progam Widget style cw 2020-06-17

                // Custom Name label cw 2020-06-12
                var name = document.getElementById('custom-location-name');
                name.innerHTML = "<strong>"+ decodeURI(urlParam("n")) +"</strong>";
                // Target the flag graphic cw 2020-06-11
                var image = document.getElementById('flag');
                let flagColor = categoryColor(fcstTomorrowData[ReportingArea.FIELDS.category]);
                image.src = "/aq-flag-widget/images/"+flagColor+"-flag.png";
                // Target the Middle Text Section cw 2020-06-12
                // old format: <b>Today\'s Air Quality <br>Forecast<br> 6/8/2020  <br></b>
                var middleText = document.getElementById('middleText');
                let date = fcstTomorrowData[ReportingArea.FIELDS.validDate];
                middleText.innerHTML = "<strong>"+currentDataType.charAt(0).toUpperCase() + currentDataType.slice(1)+"\'s Air Quality <br>Forecast<br> "+ date +"  <br>";
                // Target the Pollutant Section cw 2020-06-16
                // First / Highest Pollutant
                var poll_name = document.getElementById('poll_name');
                //console.log(fcstTomorrowData[ReportingArea.FIELDS.parameter]);
                //console.log(fcstTomorrowData[ReportingArea.FIELDS.aqi]);
                //console.log(fcstTomorrowData[ReportingArea.FIELDS.category]);
                poll_name.innerHTML = fcstTomorrowData[ReportingArea.FIELDS.parameter];
                var image = document.getElementById('poll_dot');
                let dotColor = categoryColor(fcstTomorrowData[ReportingArea.FIELDS.category]);
                image.src = "/aq-flag-widget/images/"+dotColor+"-dot.png";
                poll_cat.innerHTML = fcstTomorrowData[ReportingArea.FIELDS.category];
                // Other Pollutants
                //console.log(fcstTomorrowDataOther);
                //console.log(fcstTomorrowDataOther.length);
                let dotColorOther = "green";
                let otherPolls = "";
                for (let i = 0; i < fcstTomorrowDataOther.length; i++) {
                    //console.log(fcstTomorrowDataOther[i]);
                    //console.log(fcstTomorrowDataOther[i][ReportingArea.FIELDS.parameter]);
                    //console.log(fcstTomorrowDataOther[i][ReportingArea.FIELDS.aqi]);
                    //console.log(fcstTomorrowDataOther[i][ReportingArea.FIELDS.category]);
                    let dotColorOther = categoryColor(fcstTomorrowDataOther[i][ReportingArea.FIELDS.category]);
                    // build the entire <TR> each time through the loop cw 2020-06-16
                    eval("otherPoll"+i).innerHTML =
                        '                     <td width="4"></td>' +
                        '                     <td class="style1">'+fcstTomorrowDataOther[i][ReportingArea.FIELDS.parameter]+'</td>' +
                        '                     <td><img src="images/'+dotColorOther+'-dot.png" /></td>' +
                        '                     <td class="style1">'+fcstTomorrowDataOther[i][ReportingArea.FIELDS.category]+'</td>';
                } // end for
                // Target the Links cw 2020-06-11
                if ( window.location.href.includes("z=") ) {
                    var leftLink = document.getElementById('leftLink');
                    leftLink.href = "/aq-flag-widget/?a=current&z="+decodeURI(urlParam("z"))+"&n="+decodeURI(urlParam("n"));
                    var rightLink = document.getElementById('rightLink');
                    rightLink.href = "/aq-flag-widget/?a=today&z="+decodeURI(urlParam("z"))+"&n="+decodeURI(urlParam("n"));
                    rightLink.innerHTML = "Today\'s Forecast";
                } else if ( window.location.href.includes("city=") ) {
                    var leftLink = document.getElementById('leftLink');
                    leftLink.href = "/aq-flag-widget/?a=current&city="+decodeURI(urlParam("city"))+"&state="+decodeURI(urlParam("state"))+"&country="+decodeURI(urlParam("country"))+"&n="+decodeURI(urlParam("n"));
                    var rightLink = document.getElementById('rightLink');
                    rightLink.href = "/aq-flag-widget/?a=today&city="+decodeURI(urlParam("city"))+"&state="+decodeURI(urlParam("state"))+"&country="+decodeURI(urlParam("country"))+"&n="+decodeURI(urlParam("n"));
                    rightLink.innerHTML = "Today\'s Forecast";
                }
            } else if (currentDataType === 'tomorrow') {
                // There is NO forecast data for tomorrow; keep the Zip and Name cw 2020-07-06
                var leftLink = document.getElementById('leftLink');
                leftLink.href = "/aq-flag-widget/?a=current&z="+decodeURI(urlParam("z"))+"&n="+decodeURI(urlParam("n"));
                var rightLink = document.getElementById('rightLink');
                rightLink.href = "/aq-flag-widget/?a=today&z="+decodeURI(urlParam("z"))+"&n="+decodeURI(urlParam("n"));
                rightLink.innerHTML = "Today\'s Forecast";
            }

            if (currentDataType === 'current' && currentData) {
                //let category = aqData[ReportingArea.FIELDS.category];
                // Converted to Flag Progam Widget style cw 2020-06-17
                // Convert reporting area's 24-hour update time to 12-hour
                let time;
                let rawTime = aqData[ReportingArea.FIELDS.time];
                let hour = rawTime.split(":")[0];
                let minute = rawTime.split(":")[1];
                if (Number(hour) < 12) { // 12:00 AM - 11:59 AM
                    if (Number(hour) === 0) {
                        time = "12:" + minute + " AM";
                    } else {
                        time = "" + Number(hour) + ":" + minute + " AM";
                    }
                } else { // 12:00 PM - 11:59 PM
                    if (Number(hour) === 12) {
                        time = rawTime + " PM";
                    } else {
                        time = "" + Number(hour - 12) + ":" + minute + " PM";
                    }
                }
                let tz = aqData[ReportingArea.FIELDS.timezone];

                if (currentDataType === "current") {
                    jQuery(".aq-updated-time").html(time + " " + tz);
                } else if (currentDataType === "forecast_today") {
                    jQuery(".aq-updated-time").html("Today");
                } else {
                    jQuery(".aq-updated-time").html("Tomorrow");
                }

                // Custom Name label cw 2020-06-12
                var name = document.getElementById('custom-location-name');
                name.innerHTML = "<strong>"+ decodeURI(urlParam("n")) +"</strong>";
                // Target the flag graphic cw 2020-06-11
                // NO flags here
                var flagRow = document.getElementById('flagRow');
                flagRow.style.display = "none";
                // Target the Middle Text Section cw 2020-06-12
                // old format: <b>Today\'s Air Quality <br>Forecast<br> 6/8/2020  <br></b>
                var middleText = document.getElementById('middleText');
                let date = currentData[0][ReportingArea.FIELDS.issueDate];
                middleText.innerHTML = "<strong>"+currentDataType.charAt(0).toUpperCase() + currentDataType.slice(1)+" Air Quality <br>"+ date +"<br>"+ time + " " + tz +"<br>";
                // Target the Pollutant Section cw 2020-06-16
                // First / Highest Pollutant
                var poll_name = document.getElementById('poll_name');
                //console.log(currentData[ReportingArea.FIELDS.parameter]);
                //console.log(currentData[ReportingArea.FIELDS.aqi]);
                //console.log(currentData[ReportingArea.FIELDS.category]);

                pollRow.style.display = "none";
                // Other Pollutants
                //console.log(currentData);
                //console.log(currentData.length);
                let dotColorOther = "green";
                let otherPolls = "";
                for (let i = 0; i < currentData.length; i++) {
                    //console.log(currentData[i]);
                    //console.log(currentData[i][ReportingArea.FIELDS.parameter]);
                    //console.log(currentData[i][ReportingArea.FIELDS.aqi]);
                    //console.log(currentData[i][ReportingArea.FIELDS.category]);
                    let dotColorOther = categoryColor(currentData[i][ReportingArea.FIELDS.category]);
                    // build the entire <TR> each time through the loop cw 2020-06-16
                    eval("otherPoll"+i).innerHTML =
                        '                     <td width="4"></td>' +
                        '                     <td class="style1">'+currentData[i][ReportingArea.FIELDS.parameter]+'</td>' +
                        '                     <td class="style4" style="background-image:url(images/'+dotColorOther+'-bg-dot.png); ' +
                        '                        background-repeat:no-repeat" width="28" height="28">'+currentData[i][ReportingArea.FIELDS.aqi]+'</td>' +
                        '                     <td class="style1">'+currentData[i][ReportingArea.FIELDS.category]+'</td>';
                } // end for
                // Target the Links cw 2020-06-11
                if ( window.location.href.includes("z=") ) {
                    var leftLink = document.getElementById('leftLink');
                    leftLink.href = "/aq-flag-widget/?a=current&z="+decodeURI(urlParam("z"))+"&n="+decodeURI(urlParam("n"));
                    var rightLink = document.getElementById('rightLink');
                    rightLink.href = "/aq-flag-widget/?a=today&z="+decodeURI(urlParam("z"))+"&n="+decodeURI(urlParam("n"));
                    rightLink.innerHTML = "Today\'s Forecast";
                } else if ( window.location.href.includes("city=") ) {
                    var leftLink = document.getElementById('leftLink');
                    leftLink.href = "/aq-flag-widget/?a=current&city="+decodeURI(urlParam("city"))+"&state="+decodeURI(urlParam("state"))+"&country="+decodeURI(urlParam("country"))+"&n="+decodeURI(urlParam("n"));
                    var rightLink = document.getElementById('rightLink');
                    rightLink.href = "/aq-flag-widget/?a=today&city="+decodeURI(urlParam("city"))+"&state="+decodeURI(urlParam("state"))+"&country="+decodeURI(urlParam("country"))+"&n="+decodeURI(urlParam("n"));
                    rightLink.innerHTML = "Today\'s Forecast";
                }
            } else if (currentDataType === 'current') {
                // There is NO data for current; keep the Zip and Name cw 2020-07-06
                var leftLink = document.getElementById('leftLink');
                leftLink.href = "/aq-flag-widget/?a=current&z="+decodeURI(urlParam("z"))+"&n="+decodeURI(urlParam("n"));
                var rightLink = document.getElementById('rightLink');
                rightLink.href = "/aq-flag-widget/?a=today&z="+decodeURI(urlParam("z"))+"&n="+decodeURI(urlParam("n"));
                rightLink.innerHTML = "Today\'s Forecast";
            }

        }

    }

    // Use values from the URL cw 2020-06-08
    // https://www.sitepoint.com/url-parameters-jquery/
    function urlParam(name){
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        return results[1] || 0;
    }

    // Convert category to color for use in graphic files cw 2020-06-17
    function categoryColor(category){
        let color = "green"; // good
        if (category === "Moderate") {
            color = "yellow"; // moderate
        } else if (category === "Unhealthy for Sensitive Groups") {
            color = "orange"; // semi unhealthy
        } else if (category === "Unhealthy") {
            color = "red"; // unhealthy
        } else if (category === "Very Unhealthy") {
            color = "purple"; // very unhealthy
        } else if (category === "Hazardous") {
            color = "purple"; // hazardous
        }
        return color;
    }

    // Rotates the arrow to the provided degrees.  Degree values capped at 0 and 180
    function rotateArrow(deg) {
        // Ensure we do not rotate too far in either direction
        deg = Math.max(MIN_ROTATION_DEGREES, Math.min(deg, MAX_ROTATION_DEGREES));
        // Apply the rotation
        let arrows = document.getElementsByClassName("aq-dial-arrow");
        for (let i = 0; i < arrows.length; i++) {
            let arrow = arrows[i];
            arrow.style.webkitTransform = "rotate("+deg+"deg)";
            arrow.style.mozTransform = "rotate("+deg+"deg)";
            arrow.style.msTransform = "rotate("+deg+"deg)";
            arrow.style.oTransform = "rotate("+deg+"deg)";
            arrow.style.transform = "rotate("+deg+"deg)";
        }
    }



    const template_html =
        '<table cellpadding="0" cellspacing="0" width="200" border="1" bordercolor="#29ABE2"><tr><td>' +
        '    <table cellpadding="0" cellspacing="0" width="200" border="0">' +
        '        <tr><td width="200" align="center" class="style3" id="custom-location-name"></td></tr>' +
        '        <tr>' +
        '        <tr><td height="4"></td></tr>' +
        '        <tr id="flagRow"><td align="center" valign="middle" height="50">' +
        '        <img src="/aq-flag-widget/images/NA-flag.png" alt="Flag" id="flag" /></td></tr>' +
        '        <tr><td><hr color="#29ABE2" width="86%" /></td></tr>' +
        '        <tr>' +
        '          <td align="center" class="style2" id="middleText"></td></tr>' +
        '        <tr><td><hr color="#29ABE2" width="86%" /></td></tr>' +
        '            <tr><td>' +
        '            <table  align="center">' +
        '                <tr id="pollRow">' +
        '                <td width="2"></td>' +
        '                <td width="41" class="style1" id="poll_name"></td>' +
        '                <td width="20"><img src="/aq-flag-widget/images/NA-dot.png" id="poll_dot"/></td>' +
        '                <td width="123" class="style1" id="poll_cat"></td></tr>' +
        '                <tr id="otherPoll0"></tr>' +
        '                <tr id="otherPoll1"></tr>' +
        '                <tr id="otherPoll2"></tr>' +
        '                <tr id="otherPoll3"></tr>' +
        '                <tr id="otherPoll4"></tr>' +
        '              </table>    ' +
        '         </td></tr>' +
        '            <tr><td height="4"></td></tr>' +
        '            <tr><td>' +
        '            <table cellpadding="0" cellspacing="0">' +
        '            <tr>' +
        '            <td width="100" height="26" class="buttons"><a id="leftLink" href="/aq-flag-widget/?a=current&z=&n=">Current <br />Air Quality</a></td>' +
        '            <td width="2"></td>' +
        '            <td width="100" height="26" class="buttons"><a id="rightLink" href="/aq-flag-widget/?a=tomorrow&z=&n=">Tomorrow\'s Forecast</a></td></tr>' +
        '            <tr><td height="2"></td></tr>' +
        '            <tr><td width="100" height="26" class="buttons"> <a href="https://www.airnow.gov/aqi/aqi-basics/" target="_blank">Air Quality Index</a></td>' +
        '            <td width="2"></td>' +
        '            <td width="100" height="26" class="buttons"><a href="https://www.airnow.gov/air-quality-flag-program/schools/" target="_blank">Activity Guidance</a></td></tr>' +
        '            </table>' +
        '            </td></tr>' +
        '            <table cellpadding="0" cellspacing="0" width="200" height="40">' +
        '            <tr><td align="center"><a href="https://www.airnow.gov/air-quality-flag-program/" target="_blank"><img src="/aq-flag-widget/images/SFP-logo.png" border="0" alt="School Flag Program Logo" /></a></td><td align="center"><a href="https://www.airnow.gov" target="_blank"><img src="/aq-flag-widget/images/airnow-logo.png" alt="AirNow Logo" border="0" /></a></td><td align="center"><a href="https://www.epa.gov" target="_blank"><img src="/aq-flag-widget/images/epalogo.png" alt="EPA Logo" border="0"/></a></td></tr>' +
        '           </table>' +
        '        </table>';
})();
