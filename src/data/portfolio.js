/* PROJECT DATA FOR PORTFOLIO.JS TILES */

import { img_portfoliowebsitereact, img_singaporerentpowerbi, img_followthesunpowerbi, img_internationalmarketplacessis,
   img_internationalmarketplacepowerbi, img_customersupportagentperformance, img_satellitelaunchoverview, 
   img_internationalmarketplaceexcel, img_appsourcedenebmaps } from '../data/assets';

const portfolio = [
   {
      title: 'AppSource Deneb maps',
      description: 'Power BI report that demonstrates custom AppSource Deneb mapping using embedded geometry JSON data.',
      stamp: '2022-11',
      shortdate: 'NOV 2022',
      tech: 'POWER BI',
      photo: img_appsourcedenebmaps,
      siteURL: 'https://community.powerbi.com/t5/Data-Stories-Gallery/AppSource-Deneb-Maps/m-p/2930366',
      codeURL: 'https://makuharistudio.github.io/#/post/1669381200',
      tags: ["Power BI", "Deneb", "Vega-Lite", "Vega"]
   },
   {
      title: 'International marketplace profit',
      description: 'Excel dashboard that uses an OOTB exponential smoothing algorithm to forecast profit.',
      stamp: '2022-10',
      shortdate: 'OCT 2022',
      tech: 'EXCEL',
      photo: img_internationalmarketplaceexcel,
      siteURL: 'https://makuharistudio.github.io/#/project/ExcelInternationalMarketplaceProfitForecast',
      codeURL: 'https://github.com/makuharistudio/data-visualisation-datasets/blob/main/International%20Marketplace%20sales/Power%20Query%20and%20Deneb%20code.md',
      tags: ["Excel", "Power Pivot", "DAX", "Machine Learning"]
   },
   {
      title: 'Satellite launch overview',
      description: 'Power BI report showing actively monitored satellites using a custom Deneb scatterplot visual.',
      stamp: '2022-08',
      shortdate: 'AUG 2022',
      tech: 'POWER BI',
      photo: img_satellitelaunchoverview,
      siteURL: 'https://community.powerbi.com/t5/Data-Stories-Gallery/Satellite-launch-overview/m-p/2730077',
      codeURL: 'https://github.com/makuharistudio/data-visualisation-datasets/tree/main/Satellite%20launch%20overview',
      tags: ["Power BI", "Deneb", "Vega-Lite", "Power Query", "DAX"]
   },
   {
      title: 'Customer support agent performance',
      description: 'Excel dashboard that compares individual support staff KPIs. Includes a cell filter into Power Query to dynamically display photos.',
      stamp: '2022-06',
      shortdate: 'JUN 2022',
      tech: 'EXCEL',
      photo: img_customersupportagentperformance,
      siteURL: 'https://makuharistudio.github.io/#/project/ExcelCustomerSupportAgentPerformance',
      codeURL: 'https://github.com/makuharistudio/data-visualisation-datasets/tree/main/Support%20ticket%20updates',
      tags: ["Excel", "Power Query", "Power Pivot", "DAX"]
   },
   {
      title: 'International marketplace profit',
      description: 'Power BI report that incorporates Python profit predictions and custom Deneb visualisations.',
      stamp: '2022-04',
      shortdate: 'APR 2022',
      tech: 'POWER BI',
      photo: img_internationalmarketplacepowerbi,
      siteURL: 'https://community.powerbi.com/t5/Data-Stories-Gallery/International-Marketplace-profit-report-using-Python-and-Deneb/m-p/2480550',
      codeURL: 'https://github.com/makuharistudio/data-visualisation-datasets/blob/main/International%20Marketplace%20sales/Power%20Query%20and%20Deneb%20code.md',
      tags: ["Power BI", "Python", "Deneb", "Vega-Lite", "Power Query", "Machine Learning"]
   },
   {
      title: 'International marketplace dataset',
      description: 'SQL Server Integration Services package that merges Microsoft and Tableau sample datasets into a single warehouse.',
      stamp: '2022-01',
      shortdate: 'JAN 2022',
      tech: 'SQL SERVER',
      photo: img_internationalmarketplacessis,
      siteURL: 'https://makuharistudio.github.io/#/post/1641906000',
      codeURL: 'https://github.com/makuharistudio/data-visualisation-datasets/tree/main/International%20Marketplace%20sales',
      tags: ["T-SQL", "ETL", "SQL Server Integration Services"]
   },
   {
      title: 'Follow the sun customer support',
      description: 'Power BI report that summarises global customer service teamwork and performance. Incorporates dynamic daylight saving offsets.',
      stamp: '2021-11',
      shortdate: 'NOV 2021',
      tech: 'POWER BI',
      photo: img_followthesunpowerbi,
      siteURL: 'https://community.powerbi.com/t5/Data-Stories-Gallery/Follow-the-sun-customer-service-support/m-p/2168279',
      codeURL: 'https://github.com/makuharistudio/data-visualisation-datasets/tree/main/Support%20ticket%20updates',
      tags: ["Power BI", "Power Query", "DAX"]
   },
   {
      title: 'Singapore rental prices',
      description: 'Power BI report that shows trends of Singapore rent by quarter, flat type, and major currency conversions.',
      stamp: '2021-10',
      shortdate: 'OCT 2021',
      tech: 'POWER BI',
      photo: img_singaporerentpowerbi,
      siteURL: 'https://community.powerbi.com/t5/Data-Stories-Gallery/Quarterly-Singapore-median-rental-prices-by-currency/m-p/2125424',
      codeURL: 'https://github.com/makuharistudio/data-visualisation-datasets/tree/main/Singapore%20rental%20prices',
      tags: ["Power BI", "Power Query", "DAX"]
   },
   {
      title: 'Website portfolio and blog',
      description: 'This website is coded from scratch using HTML, CSS, React.js and GitHub Pages. The most recent is the 4th version, completed in July 2023.',
      stamp: '2021-09',
      shortdate: 'SEP 2021',
      tech: 'REACT.JS',
      photo: img_portfoliowebsitereact,
      siteURL: '',
      codeURL: 'https://github.com/makuharistudio/makuharistudio.github.io/',
      tags: ["HTML","CSS","React.js"]
   }
]

export default portfolio;