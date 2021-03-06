#!/usr/bin/env zx

/***
 * addWords function
 * appends $words to file $fileName in repo $repoName
 * Params as Object:
 * {
 *  words ("foo ")<string>: content appended to the file
 *  fileName (README.md) <string>: name of the file to append
 *  repoName (gitskeles) <string>: name of the new repo
 * }
 */
async function addWords({words="X",fileName="README.md", repoName="gitskeles"}){
  await $`printf ${words} >> ${os.homedir()}/${repoName}/${fileName}`;
};

/***
 * gitRoll function
 * adds, commits w/$msg, on $dateStr
 * Params as Object:
 * {
 *  dateStr (Epoch) <string>: date to ammend time of commit to
 *  repoName (gitskeles) <string>: name of new repo
 *  msg (update README) <string>: 
 * }
 */
async function gitRoll({dateStr="Thu Jan 1 00:00:00 UTC 1970", repoName="gitskeles", msg="update README"}){
  await $`cd ${os.homedir()}/${repoName};git add .; git commit -m ${msg} --date="${dateStr}"`;
};


/***
 * main iife function
 */
(async function(){
  /***
   * Default times
   * today
   * year before last Sunday
   */
  const now = new Date();
  const today = new Date(`${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()}`);
   const yearAgo = new Date(`${today.getMonth()+1}/${today.getDate()}/${today.getFullYear()-1}`);
  const yBLSun = new Date(yearAgo.getTime() + 1000*60*60*12 - (yearAgo.getDay() * 1000*60*60*24)); //added 12 hrs for savings times

  /***
   * check for argv's
   * or ask corresponding question
   *  -r:repo (gitskeles) Repo Name
   *  -p:string (skele pattern) string of X's and ' 's to render as pattern
   *  -s:start date (year ago sunday) string mm/dd/yyyy
   *  -e:end date (today) string mm/dd/yyyy
   */
  let {r, p, s, e} = argv; 
  let repo = r!=undefined && String(r) || 
    await question("Repo Name (gitskeles):") || 
    'gitskeles';
  let patternString = p!=undefined && String(p) || 
    await question("Please enter a string of spaces and x's (skele):") || 
    "01111001110011111011011110111110110111001101111000000000";
  let startDate = s!=undefined && String(s) ||
    await question("Please enter a Start Date (last Sunday -1yr.):");
  startDate = startDate && new Date(startDate) || yBLSun;
  let endDate = e!=undefined && String(e) ||
    await question("Please enter an End Date (today):");
  endDate = endDate && new Date(endDate) || today;

  console.log(s);
  console.log(startDate);
  console.log(e);
  console.log(endDate);
  await question('pause');
  
  /* Pattern arrays
   * splits patternString
   * pads right of array with 0's to fill rest of week
   */
  let pattern = patternString.split('').map(c=>(c!=0)?1:0);
  let originalLength = pattern.length;
  let wks = Math.ceil(originalLength / 7);
  pattern.length = wks * 7;
  pattern.fill(0, originalLength);
  console.log(pattern);
  await question('pause');

  /* Create the repo
   */
  await $`rm -rf ${os.homedir()}/${repo}; mkdir ${os.homedir()}/${repo}`;
  await $`cd ${os.homedir()}/${repo}; git init;`;

 
  // time counters
  let backTime = startDate.getTime();
  let backDate = startDate;
  const endTime = endDate.getTime() + 1000*60*60*12; //+12hrs for savings time
  
  /***
   * Creates and commits README entry according
   * to weekly schedule for past year.
   */
  async function walkPattern(pxs){
    let day = 0;
    for(px of pxs){
      day++;
      if(px){
        await addWords({repoName:repo});
        await gitRoll({dateStr:backDate, repoName:repo});
      }else{
        await addWords({words:" ", repoName:repo});
      }
      if(backTime >= endTime) return 0;
      backTime += (1000*60*60*24);
      backDate = new Date(backTime);
      if(day >= 7){
        await addWords({words:"\n", repoName:repo});
        day = 0;
      };
    }
  }
  while(backTime < endTime){
    await walkPattern(pattern);
  };
})();
