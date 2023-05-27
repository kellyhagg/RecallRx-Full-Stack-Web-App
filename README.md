# RecallRx

## One Sentence Pitch

Our team, RecallRx, has developed an application to help people who are concerned
with preserving their cognitive health by providing personalized recommendations and
tips, reminders, and symptom monitoring in the form of monthly medical questionnaires.

## Project Description

RecallRx is an machine learning powered application designed to help users prevent cognitive decline and reduce the risk of dementia. The app utilizes a machine learning algorithm to offer personalized recommendations and reminders based on the user's daily activities. It also includes monthly dementia screenings in the form of an MMSE (Mini-Mental State Examination, see Credit #17) which is the industry
standard tool. These scores are stored and displayed to the user in a graph to track cognitive progress over time, with alerts prompting users to seek medical attention if screening results indicate potential clinical levels of concern.

## Motivation

The purpose of developing RecallRx is to empower individuals to take proactive steps in preserving their cognitive health and delaying the onset of dementia. We recognize the debilitating effects of dementia on daily life and independent functioning, such as memory loss, speech impairment, and difficulties in problem-solving. By conducting thorough research on dementia, we believe that this app can provide users with valuable tools to mitigate their risk and maintain cognitive well-being.

Existing applications on the market often lack the integration of brain training exercises, personalized recommendations, and comprehensive symptom monitoring. Our goal is to create an all-in-one app that combines these features, leveraging our collective knowledge and expertise within the given timeframe to deliver the most beneficial user experience.

## Project Technologies

- VSCode 1.78
- JavaScript 2023
- HTML/CSS
- EJS 3.1.9
- Bcrypt 5.1.0
- Dotenv 16.0.3
- Joi 17.9.2
- jQuery 4.5.2
- Bootstrap 5.3.0
- Github Copilot 1.84.0.1
- ChatGPT-3
- Express.js 4.18.2
- Node.js 2.0.22
- MongoDB 5.5.0

## List of Files

- emails
    - reset-password-email.html
- public
    - images: 24 images for backgrounds and objects
    - music: 2 songs
    - resources
        - alzheimer.csv (Kaggle)
        - cigarette_relative_risk_data.json
        - objects.json
        - sentences.json (ChatGPT)
        - words.json (ChatGPT)
    - scripts
        - account.js
        - alzheimers_risk.js
        - customize_email_validation_toast.js
        - customized_password_validation_toast.js
        - handle-easter-egg-popup.js
        - handle-popup-on-settings.js
        - mmse-helpers.js
        - mmse.js
        - player.js
        - playlist.js
        - recommendations_algorithm.js
        - reveal-hidden-elements.js
        - update-notifications.js
    - style.css
- views
    - templates
        - easter-egg-popup.ejs
        - footer.ejs
        - header-back.ejs
        - header-no-nav.ejs
        - header.ejs
        - mmse-footer.ejs
        - popup.ejs
    - 404.ejs
    - coming-soon.ejs
    - daily-activity-tracking.ejs
    - dailyrecommendation.ejs
    - email-edit.ejs
    - forgot-password.ejs
    - homepage.ejs
    - index.ejs
    - login.ejs
    - logout.ejs
    - meditation.ejs
    - messages.ejs
    - mmse-landing-page.ejs
    - mmse-orientation.ejs
    - mmse-results.ejs
    - mmse-sentence-recall.ejs
    - mmse-word-reversal.ejs
    - notifications.ejs
    - password-change.ejs
    - reset-password.ejs
    - riskfactorquestions.ejs
    - riskfactorsurvey.ejs
    - settings.ejs
    - signup.ejs
    - surveyfinished.ejs
    - user-name-edit.ejs
- databaseConnection.js
- index.js
- package.json
- Procfile
- README.md
- utils.js


## Installation

Upon download of this code, this can be opened in an IDE of your choosing. Ensure that the following
dependencies are installed.

Dependencies:
    "bcrypt": "^5.1.0",
    "connect-mongo": "^5.0.0",
    "csv-parser": "^3.0.0",
    "dotenv": "^16.0.3",
    "ejs": "^3.1.9",
    "express": "^4.18.2",
    "express-mongo-sanitize": "^2.2.0",
    "express-session": "^1.17.3",
    "fs": "^0.0.1-security",
    "joi": "^17.9.2",
    "jsonwebtoken": "^9.0.0",
    "mongodb": "^5.5.0",
    "nodemailer": "^6.9.2",
    "nodemon": "^2.0.22",
    "simple-statistics": "^7.8.3"

To create a suitable server, refer to the MongoDB Atlas documentation located at the following link:
https://www.mongodb.com/docs/atlas/

## Usage

Visit https://recallrx.onrender.com/ in order to sign up and use the RecallRx app. This app is a
mobile-first designed app, which is optimized for the mobile user experience. This app still works
as intended on desktop.

## Features

RecallRx offers a range of features and tools to support the cognitive health of our Personae:

1. Monthly Mini Mental State Evaluation (MMSE) Questionnaire: Users can regularly assess their cognitive state and identify potential areas of concern through the MMSE questionnaire. This tests their ability to correctly identify the time and day, recall common objects, spell the reverse of words, and repeat
a sentence they hear. Scores are weighted based on the MMSE (Credit #17), and users are informed
if their results are normal or abnormal. If normal, users are shown a graph of the last 5 scores
to track their progress. If abnormal, users are directed to seek the assistance of a medical
professional for further evaluation.

2. Personalized Recommendations and Reminders: Based on the user's daily activities, RecallRx provides customized recommendations and reminders to target efforts towards maintaining cognitive function. These appear on the homepage and on the daily recommendations page when clicking "Tips & Trends" on the homepage

3. Activity Tracking: Clicking on the leftmost button on the bottom nav ("Activities"), or on the running circular man in the homepage takes you to the activities page where users can enter their daily activities for exercise, socialization, smoking, and alcohol consumption. When submit is pressed, these are updated to the database.

4. Signup Survey: A signup survey is asked to be completed. From these results, users are given the percent chance that they currently have dementia, as calculated from our Kaggle dataset using linear regression.

5. Meditation Easter Egg:
If users are successfully meeting their goals 4 days in a row, a third button appears to the left of the "questionnaire" button on the homepage, where users can watch a nice animation and listen to meditative music.

6. Notifications settings: In the settings option on the far right side of the bottom nav bar, users can update their notifications settings for how often they would like to receive a reminder to complete the MMSE questionnaire.

7. General: To tie all of these features together, RecallRx allows users to sign up, log in, log out, and reset their password via their email if they if they forget. Users can also change their email in the settings page, and find contact information for our team in the "Help and support" section of the settings page.

## Team & Contact

Shuyi Liu, sliu220@my.bcit.ca
Kelly Hagg, kellyahagg@gmail.com
Olga Zimina, olga.vic.zimina@gmail.com

## Credits 

1. [Smoking and Dementia - Alzheimer's Research UK](https://www.alzheimersresearchuk.org/blog/all-you-need-to-know-about-smoking-and-dementia/#:~:text=A%20recent%20review%20of%2037,likely%20to%20develop%20Alzheimer's%20disease.)

2. [The Impact of Physical Exercise on Dementia - Mayo Clinic](https://www.mayoclinic.org/healthy-lifestyle/fitness/expert-answers/exercise/faq-20057916)

3. [Physical Exercise and Dementia Prevention - Alzheimer's Society](https://www.alzheimers.org.uk/about-dementia/risk-factors-and-prevention/physical-exercise)

4. [Social Activity and Dementia - Medical News Today](https://www.medicalnewstoday.com/articles/326064#Studying-social-activity-and-dementia)

5. [Dementia Statistics - Alzheimer's International](https://www.alzint.org/about/dementia-facts-figures/dementia-statistics/)

6. [Dementia Information - Centers for Disease Control and Prevention](https://www.cdc.gov/aging/dementia/index.html#:~:text=Alzheimer's%20disease.,specific%20changes%20in%20the%20brain)

7. [The Relationship Between Smoking and Dementia - NCBI](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5781309/)

8. [Association Between Smoking and Dementia - British Medical Journal](https://www.bmj.com/content/362/bmj.k2927)

9. [Bootstrap Carousel Example] (https://getbootstrap.com/docs/4.0/components/carousel/)

10. [Bootstrap Carousel Example] (https://getbootstrap.com/docs/5.3/examples/carousel/)

11. [Adding swipe support to Bootstrap Carousel 3.0] (https://lazcreative.com/blog/adding-swipe-support-to-bootstrap-carousel-3-0/)

12. [HTML - How do I generate a progress bar circle with a percentage in and set the value with JS or jQuery?](https://stackoverflow.com/questions/49345858/html-how-do-i-generate-a-progress-bar-circle-with-a-percentage-in-and-set-the)

13. [POST request with json data in reveal-hidden-elements.js] (implemented with assistance of ChatGPT)

14. [Date manipulations in update-notifications.js] (implemented with assistance of ChatGPT)

15. [Login API in index.js]  (modified code block from COMP 2537 Assignment 2 by Olga Zimina)

16. [Bootstrap 4 Horizontal Scrolling] (<https://codepen.io/Temmio/pen/gKGEYV>)

17. [Mini-Mental State Evaluation Tool] (https://cgatoolkit.ca/Uploads/ContentDocuments/MMSE.pdf)

README.md made with the assistance of ChatGPT