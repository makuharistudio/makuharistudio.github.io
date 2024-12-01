import React from 'react';
import '../App.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ExcelCustomerSupportAgentPerformance() {

    const script = document.createElement("script");

    script.src = "https://onedrive.live.com/embed?resid=DA6E81822ACC224B%21116&authkey=%21AM967yoy5TdZEY8&em=3&wdItem=%22'Dashboard'!A%3AXFD%22&wdDivId=%22myExcelDiv%22&wdActiveCell=%22'Dashboard'!B10%22&wdAllowInteractivity=1&wdAllowTyping=1&action=embedview&wdbipreview=true";
    script.async = true;

    document.body.appendChild(script);

    return (
        <>
            <Header />
            <div className='post'>
                <center>
                    <div className='post-body'>
                        <h4 className='post-meta'>20 June 2022</h4>
                        <h1>Excel project: Customer Support Agent Performance Dashboard</h1>
                        <p>This is a single worksheet Excel redux of my "Follow the sun customer support report" Power BI report.</p>

                        <br></br>
                        <p>
                            <img src='https://github.com/makuharistudio/makuharistudio.github.io/raw/main/src/assets-portfolio/img-2022-06-excel-customer-support-agent-performance-original.png' loading='lazy'></img>
                        </p>
                        <br></br>

                        <p>You can find a copy of this Excel dashboard to download here:</p>
                        <ul>
                            <li>
                                <a href='https://github.com/makuharistudio/data-visualisation-datasets/raw/main/Support%20ticket%20updates/Customer%20Support%20Agent%20Performance%20Dashboard.xlsx?raw=true'>
                                https://github.com/makuharistudio/data-visualisation-datasets/raw/main/Support%20ticket%20updates/Customer%20Support%20Agent%20Performance%20Dashboard.xlsx
                                </a>
                            </li>
                        </ul>
                        <p>Note: This Excel file makes a connection to my GitHub repository where the data is stored, and may require you to "Enable content" when you open the file to access the External Data Connection.</p>

                        <br></br>

                        <p>Most of the Power Query and DAX code used in this Excel dashboard is similar to the code used in my Power BI report, except most of the DAX measures now include USERELATIONSHIP due to a data model improvement.</p>

                        <br></br>
                        <br></br>

                        <p>The Excel dashboard is also embedded below using the OneDrive free version. 
                           Due to OneDrive's restrictions with External Data Connections and Camera Tools, the dashboard cannot dynamically display support agent images nor refresh its data connection.
                           So it is recommended you download the Excel file from the link above and open it from a desktop version of Excel.
                        </p>

                        <br></br>
                        <br></br>

                        <p><b>References</b></p>
                        <p>These resources were used to create this Excel dashboard:</p>
                        <ul>
                            <li>
                                <a href='https://www.youtube.com/watch?v=gK2yBpiITvI'>YouTube Tutorial on how to map an Excel cell value as an input parameter for Power Query by ExcelIsFun</a>
                            </li>
                            <li>
                                <a href='https://www.youtube.com/watch?v=6qOL69bIQz8'>YouTube Tutorial on how to create a Call Center Performance Dashboard in Excel by Other Level's</a>
                            </li>
                            <li>
                                <a href='https://www.youtube.com/watch?v=T4sZSXdQ4Vg&t=1395s'>YouTube Tutorial on how to dynamically display photos ased on slicer selection in Excel by Other Level's</a>
                            </li>
                            <li>
                                <a href='https://www.youtube.com/watch?v=uvA-U9FKgPw&t=385s'>YouTube Tutorial on how to embed Excel workbook to web via OneDrive Personal free version by MyOnlineTrainingHub</a>
                            </li>
                            <li>
                                <a href='https://stackoverflow.com/questions/34424845/adding-script-tag-to-react-jsx'>Stackoverflow Question on how to run HTML script tag equivalents inside a React component</a>
                            </li>
                        </ul>


                    </div>

                    <div id="myExcelDiv" className='project-excelcustomersupportagentperformance'></div>

                </center>
            </div>
            <Footer />
        </>
    )

}