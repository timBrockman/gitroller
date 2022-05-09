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
async function addWords({words="foo ",fileName="README.md", repoName="gitskeles"}){
  await $`printf ${words} >> ~/${repoName}/${fileName}`;
};

/***
 * gitRoll function
 * adds, commits w/$msg, and amends in repo $repoName on $dateStr
 * Params as Object:
 * {
 *  dateStr (Epoch) <string>: date to ammend time of commit to
 *  repoName (gitskeles) <string>: name of new repo
 *  msg (update README) <string>: 
 * }
 */
async function gitRoll({dateStr="Thu Jan 1 00:00:00 UTC 1970", repoName="gitskeles", msg="update README"}){
  await $`cd ~/${repoName};git add .; git commit -m ${msg}; GIT_COMMITTER_DATE="${dateStr}" git commit --amend --no-edit --date "${dateStr}"`;
};


/***
 * main iife function
 */
(async function(){
  let repo = await question("Repo Name (gitskeles):") || 'gitskeles';
  /* Pattern arrays
   */
   
  /* Create the repo
   */
  await $`rm -rf ~/${repo}; mkdir ~/${repo}`;
  await $`cd ~/${repo}; git init;`;

  /**
   * Date() in JS vs bsd or gnu Date
   */
  const now = new Date();
  const today = new Date(`${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()}`);
  const yearAgo = new Date(`${today.getMonth()+1}/${today.getDate()}/${today.getFullYear()-1}`);
  const yBLSun = new Date(yearAgo.getTime() + 1000*60*60*12 - (yearAgo.getDay() * 1000*60*60*24)); //added 12 hrs for savings times
  
  // time counters
  let backTime = yBLSun.getTime();
  let backDate = yBLSun;
  const todayTime = today.getTime() + 1000*60*60*12; //+12hrs for savings time
  
  /***
   * Creates and commits README entry according
   * to weekly schedule for past year.
   */
  async function walkSkele(){
    const weeks = [
      [0,1,1,1,1,0,0],
      [1,1,1,0,0,1,1],
      [1,1,1,0,1,1,0],
      [1,1,1,1,0,1,1],
      [1,1,1,0,1,1,0],
      [1,1,1,0,0,1,1],
      [0,1,1,1,1,0,0],
      [0,0,0,0,0,0,0],
    ];
    for(week of weeks){
      for(day of week){
        if(day){
          await addWords({words:"X", repoName:repo});
          await gitRoll({dateStr:backDate, repoName:repo});
        }else{
          await addWords({words:" ", repoName:repo});
        }
        if(backTime >= todayTime) return 0;
        backTime += (1000*60*60*24);
        backDate = new Date(backTime);
      }
      await addWords({words:"\n", repoName:repo});
    }
  }
  while(backTime < todayTime){
    await walkSkele();
  };
})();
