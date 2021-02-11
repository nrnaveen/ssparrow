var express = require('express');
var router = express.Router();
var puppeteer = require('puppeteer');
var _ = require('lodash');
var fs = require('fs');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: `Naveen Survey Sparrow's Demo` });
});

/* POST Take Screent webpage. */
router.post('/', async function (req, res, next) {
  try {
    console.log('in screenshot')
    let url = _.get(req, 'body.url', 'https://surveysparrow.com'),
      width = _.get(req, 'body.width'),
      height = _.get(req, 'body.height'),
      format = _.get(req, 'body.format', 'jpeg');
    /* let browser = await puppeteer.launch((process.env.IsDevMachine === 'Yes') ? { headless: true, } : {
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox']
    }), page = await browser.newPage(); */
    let browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    }), page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    if (!_.isEmpty(width) && _.isEmpty(width)) {
      await page.setViewport({ width: width, height: height });
    }
    let screenshot, fileName = url.split('/')[2], contentType = `image/${format}`;
    if (format === 'pdf') {
      screenshot = await page.pdf({ format: 'Letter', });
      contentType = `applicant/pdf`;
    } else screenshot = await page.screenshot({ type: format, fullPage: true, });
    await browser.close();
    res.setHeader('Content-disposition', `attachment; filename=${fileName}.${format}`);
    res.setHeader('Content-type', contentType);
    fs.writeFileSync(`${fileName}.${format}`, screenshot);
    return res.end(screenshot);
  } catch (err) {
    console.log(err);
    res.status(400).send({
      err: err.message,
    });
  }
});

module.exports = router;