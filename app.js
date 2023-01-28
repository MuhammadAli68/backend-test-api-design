let githubtoken = "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";
let github_username = "MuhammadAli68";

const express = require('express');
const cors = require ('cors');
const body_parser = require("body-parser");
const {Octokit} = require ("@octokit/core");
const octokit = new Octokit({
    auth: githubtoken
  });

const app = express();
app.use(body_parser.urlencoded({extended:false}));
app.use(body_parser.json());
app.use(cors());

async function getrepos(){
    const response = await octokit.request('GET /orgs/{org}/repos', {
        org: 'airbnb',
        type: 'public',
      });
    return response;
}

async function getcontributors(repository){
  const response = await octokit.request('GET /repos/{owner}/{repo}/contributors{?anon,per_page,page}', {
    owner: repository.owner,
    repo: repository.repo_name
  })
  return response;
}

var repo_info = getrepos();//function returns a promise
var repo_list = [];
var contributors = [];
var final_arr = [];

//getting repo information
repo_info.then((repo)=>{//executes promise to get repos
  repo.data.forEach(repository=>{
    let temp_obj = {repo_name:repository.name,rep_creation_year:repository.created_at.split("-")[0],rep_creation_month:repository.created_at.split("-")[1],owner:repository.owner.login};
    repo_list.push(temp_obj);
  });
});

//getting contributors information
setTimeout(()=>{
  repo_list.forEach((repository)=>{
    let contributer_info = getcontributors(repository);
    contributer_info.then((contrib)=>{ //executes promise to get contributors
      let temp_obj = {};
      temp_obj.repo = repository.repo_name;
      temp_obj.new_contrib_list = [];
      contrib.data.forEach((contributor)=>{
          if(contributor.contributions < 5) //Assuming that a new contrubutor is some one who has less than 5 contributions
          {
            temp_obj.new_contrib_list.push(contributor.login);
          }
        }
      );
      contributors.push(temp_obj);
    });
   }
  );
},3000);

//create a final object and add to a final array
setTimeout(()=>{
  for(let i=0;i<repo_list.length;i++)
  {
    let final_object = {};
    final_object["org"] = "airbnb";
    final_object["repository"] = repo_list[i].repo_name;
    final_object["year"] = repo_list[i].rep_creation_year;
    final_object["month"] = repo_list[i].rep_creation_month;
    contributors.forEach(obj=>{
      if(obj.repo === repo_list[i].repo_name)
      {
        final_object["newContributors"] = obj.new_contrib_list;
      }
    });
    final_arr.push(final_object);
  }
},6000);

//exposing two APIs to query and get new contributors
setTimeout(()=>{
  app.get("/airbnb/:reponame/:year",(req,res)=>{
    final_arr.forEach(obj=>{
      if(obj["repository"] == req.params.reponame && obj["year"] == req.params.year)
      {
        res.send(obj);
      }
    });
});


  app.get("/airbnb/:reponame/:year/:month",(req,res)=>{
    final_arr.forEach(obj=>{
      if(obj["repository"] == req.params.reponame && obj["year"] == req.params.year && obj["month"] == req.params.month)
      {
        res.send(obj);
      }
    });
});
  app.listen(3000);
},9000);