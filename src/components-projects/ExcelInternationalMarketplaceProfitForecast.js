import React, { useEffect } from 'react';
import '../App.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { logo_excel } from '../data/assets';

export default function ExcelCustomerSupportAgentPerformance() {
    useEffect(() => {
        // Check if the script already exists to prevent duplication
        if (!document.getElementById('onedrive-script')) {
            const script = document.createElement("script");
            script.src = "https://onedrive.live.com/embed?resid=DA6E81822ACC224B%21121&authkey=%21ACJCWZMy8qHCeeU&em=3&wdItem=%22'Report'!A1%3AX50%22&wdDivId=%22myExcelDiv%22&wdHideGridlines=1&wdActiveCell=%22'Report'!A1%22&wdAllowTyping=1&action=embedview&wdbipreview=true";
            script.async = true;
            script.id = 'onedrive-script';  // Set an id to identify the script

            document.body.appendChild(script);

            // Clean up the script when the component unmounts
            return () => {
                document.body.removeChild(script);
            };
        }
    }, []); // Empty dependency array ensures this effect runs only once on mount

    return (
        <div className='container'>
            <div className="interface">
                <Header mp3credit='♪♪♪ Now playing: Time Flows by Evgeny_Bardyuzha @ pixabay.com' mp3='https://github.com/makuharistudio/makuharistudio.github.io/raw/main/src/assets-theme/music-evgeny-bardyuzha-time-flows.mp3' />

                <div className='post'>
                    <div className='post-panel'>
                        <div className='post-overlay'></div>
                        <div className='post-title-banner'></div>
                        <div className='post-title'>
                            <p>Excel project: International Marketplace Profit Dashboard</p>
                        </div>
                        <div className='separator-glow'></div>
                        <div className='post-date'>
                            <p>26 October 2022</p>
                        </div>
                        <div className='post-body'>
                            <p>You can download this Excel report from here:</p>
                            <ul>
                                <li>
                                    <a href='https://github.com/makuharistudio/data-visualisation-datasets/raw/main/International%20Marketplace%20sales/International%20Marketplace%20Profit%20Dashboard.xlsx?raw=true'>
                                    https://github.com/makuharistudio/data-visualisation-datasets/raw/main/International%20Marketplace%20sales/International%20Marketplace%20Profit%20Dashboard.xlsx
                                    </a>
                                </li>
                            </ul>

                            <p>It connects to my GitHub repository data, so please click "Enable content" to access that External Data Connection.</p>

                            <p>
                                <img src='https://github.com/makuharistudio/makuharistudio.github.io/blob/main/src/assets-portfolio/img-2022-10-excel-international-marketplace-profit-forecast.gif?raw=true' loading='lazy'></img>
                            </p>

                            <p>This Excel report is a redux of my "International marketplace profit" Power BI report, the latter you can find here:</p>

                            <ul>
                                <li>
                                    <a href='https://community.powerbi.com/t5/Data-Stories-Gallery/International-Marketplace-profit-report-using-Python-and-Deneb/m-p/2480550'>
                                    https://community.powerbi.com/t5/Data-Stories-Gallery/International-Marketplace-profit-report-using-Python-and-Deneb/m-p/2480550
                                    </a>
                                </li>
                            </ul>

                            <br></br>
                            

                            <p>Most of the DAX code used is similar to my Power BI report. You can find some of that code in my Github here:</p>

                            <ul>
                                <li>
                                    <a href='https://github.com/makuharistudio/data-visualisation-datasets/blob/main/International%20Marketplace%20sales/Power%20Query%20and%20Deneb%20code.md#excel-report-model'>
                                    https://github.com/makuharistudio/data-visualisation-datasets/blob/main/International%20Marketplace%20sales/Power%20Query%20and%20Deneb%20code.md#excel-report-model
                                    </a>
                                </li>
                            </ul>

                            <p> I also used Excel's out-of-the-box FORECAST.ETS function to create the monthly profit forecasting. You can find more information on my exploration of this feature in this blog post:</p>

                            <ul>
                                <li>
                                    <a href='https://makuharistudio.github.io/#/post/1666962000'>https://makuharistudio.github.io/#/post/1666962000</a>
                                </li>
                            </ul>

                            <br></br>

                            <p>The Excel report is also embedded below using the OneDrive free version.</p>
                            <p>Due to OneDrive's restrictions with External Data Connections, the report cannot dynamically refresh its data connection.
                            So it is recommended you download the file and open it from a desktop version of Excel.
                            </p>

                            <br></br>

                            <div id="myExcelDiv" className='embedded-excel'></div>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>

            <div className="bg-beige">
                <div className="bg-beige-tiles">
                    <center>
                        <div className='gear-beige-1 gear-1-spin'></div>
                        <div className='gear-beige-2 gear-2-spin'></div>
                    </center>
                </div>
            </div>
        </div>
    );
}