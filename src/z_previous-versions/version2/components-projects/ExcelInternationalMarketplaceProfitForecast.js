import React from 'react';
import '../App.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function InternationalMarketplaceProfitForecast() {

    const script = document.createElement("script");

    script.src = "https://onedrive.live.com/embed?resid=DA6E81822ACC224B%21121&authkey=%21ACJCWZMy8qHCeeU&em=3&wdItem=%22'Report'!A1%3AX50%22&wdDivId=%22myExcelDiv%22&wdHideGridlines=1&wdActiveCell=%22'Report'!A1%22&wdAllowTyping=1&action=embedview&wdbipreview=true";
    script.async = true;

    document.body.appendChild(script);

    return (
        <>
            <Header />
            <div className='post'>
                <center>
                    <div className='post-body'>
                        <h4 className='post-meta'>26 October 2022</h4>
                        <h1>Excel project: International Marketplace Profit Dashboard</h1>
                        <p>This is a single worksheet Excel redux of my "International marketplace profit" Power BI report.</p>

                        <br></br>
                        <p>
                            <img src='https://github.com/makuharistudio/makuharistudio.github.io/raw/main/src/assets-portfolio/img-2022-10-excel-international-marketplace-profit-forecast-original.png' loading='lazy'></img>
                        </p>
                        <br></br>

                        <p>You can find a copy of this Excel dashboard to download here:</p>
                        <ul>
                            <li>
                                <a href='https://github.com/makuharistudio/data-visualisation-datasets/raw/main/International%20Marketplace%20sales/International%20Marketplace%20Profit%20Dashboard.xlsx?raw=true'>
                                https://github.com/makuharistudio/data-visualisation-datasets/raw/main/International%20Marketplace%20sales/International%20Marketplace%20Profit%20Dashboard.xlsx
                                </a>
                            </li>
                        </ul>
                        <p>Note: This Excel file makes a connection to my GitHub repository where the data is stored, and may require you to "Enable content" when you open the file to access the External Data Connection.</p>

                        <br></br>
                        
                        <p>Some of the DAX code used in this Excel dashboard is similar to the DAX used in my Power BI report.</p>

                        <p>I used Excel's out-of-the-box FORECAST.ETS function to create the monthly profit forecasting. You can find more information on my exploration of this feature in this blog post:</p>

                        <ul>
                            <li>
                                <a href='https://makuharistudio.github.io/#/post/1666962000'>https://makuharistudio.github.io/#/post/1666962000</a>
                            </li>
                        </ul>

                        <br></br>
                        <br></br>

                        <p>The Excel dashboard is also embedded below using the OneDrive free version.</p>
                        <p>Note my OneDrive version has no support for mapping nor interactivity for external data connections, so I would recommend you download a copy from the link above.</p>

                        <br></br>
                        <br></br>


                    </div>

                    <div id="myExcelDiv" className='project-excelinternationalmarketplaceprofit'></div>

                </center>
            </div>
            <Footer />
        </>
    )

}