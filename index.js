const alfy = require('alfy');
const fs = require('fs');

const projectsFile = process.env.PROJECTS_FILE
  ? expandEnvVars(process.env.PROJECTS_FILE)
  : undefined;

if (!projectsFile) {
  console.log('The PROJECTS_FILE and environment variables must be configured');
  process.exit(1);
}

function expandEnvVars(str) {
  return str.replace(/(\$HOME|\~)/g, (original, matched) => {
    const sanitizeEnv = matched.replace('$', '');
    const expandedEnv = process.env[sanitizeEnv];
    return expandedEnv ? expandedEnv : '';
  });
}

function findPathInProjects(projects, name) {
  return projects.filter(
    project => project.name.includes(name)  
  );
}

function readVsCodeProjectFile(projectFilePath) {
  const parsedProjectsFile = JSON.parse(fs.readFileSync(projectFilePath, 'utf8'));
  
  if (!parsedProjectsFile.every(project => project.hasOwnProperty('rootPath'))) {
    throw new Error(
      'Invalid VSCode projects file: The file must be a JSON file with an array of objects representing projects'
    );
  }
  
  const projects = parsedProjectsFile.map(project => ({
    name: project.name,
    path: project.rootPath
  }));
  return projects;
}

const projects = readVsCodeProjectFile(projectsFile);
const items = findPathInProjects(projects, alfy.input).map(element => {
  return {
    title: element.name,
    subtitle: element.path,
    arg: element.path
  };
});

alfy.output(items);
