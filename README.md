# Richard Enterprises Bus Ticket Application

## DevOps CI/CD Automation Project

The Richard Enterprises Bus Ticket Application is a DevOps training project
designed to demonstrate an automated software deployment pipeline using
Git, GitHub, GitHub Actions, Ansible, AWS EC2, and Apache.

The application provides a web-based bus schedule where users can view
available buses, destinations, departure and arrival times, ticket prices,
and purchase options.

The primary objective of this project is not only to build the web
application, but also to demonstrate how application changes can be
automatically deployed from source control to a web server using DevOps
practices.

## Project Objectives

- Build and maintain application source code using Git.
- Store and manage the project in GitHub.
- Use separate AWS EC2 instances for different infrastructure roles.
- Automate server configuration and application deployment with Ansible.
- Configure a self-hosted GitHub Actions runner.
- Trigger deployments automatically when code is pushed to the main branch.
- Deploy the application to an Apache web server.
- Maintain SELinux in Enforcing mode.
- Demonstrate an end-to-end Continuous Deployment workflow.

## AWS Infrastructure

The project uses three AWS EC2 instances:

### 1. git-server

- Stores the working Git repository.
- Used to develop and modify the application.
- Commits application changes with Git.
- Pushes source code to GitHub.

### 2. ansible01

- Functions as the Ansible control node.
- Hosts the GitHub Actions self-hosted runner.
- Receives deployment jobs from GitHub Actions.
- Executes the Ansible deployment playbook.
- Connects to the application server over SSH.

### 3. bus-ticket-app-server

- Functions as the application web server.
- Runs Apache HTTP Server.
- Receives application files from Ansible.
- Serves the Bus Ticket Application to users.

## CI/CD Architecture

The automated deployment process follows this sequence:

Developer -> Git -> GitHub -> GitHub Actions -> Self-Hosted Runner ->
Ansible -> AWS EC2 Application Server -> Apache -> Live Website
## Technologies Used

- AWS EC2 - Hosts the Linux servers used by the project.
- Red Hat Enterprise Linux (RHEL) - Operating system used on the EC2 instances.
- Git - Provides local source-code version control.
- GitHub - Hosts the remote Git repository.
- GitHub Actions - Provides CI/CD workflow automation.
- Self-Hosted GitHub Actions Runner - Executes GitHub Actions jobs on ansible01.
- Ansible - Automates application deployment to the web server.
- SSH - Provides secure communication between systems.
- Apache HTTP Server - Hosts and serves the Bus Ticket web application.
- HTML - Provides the structure of the web application.
- CSS - Provides the visual styling of the application.
- JavaScript - Provides application functionality and interaction.
- systemd - Manages the GitHub Actions runner as a Linux service.
- SELinux - Provides mandatory access control and system security on RHEL.

## Repository Structure

```text
bus-ticket-application/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── ansible/
│   ├── inventory/
│   │   └── hosts.ini
│   └── deploy.yml
├── app/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── .gitignore
└── README.md:

## GitHub Actions CI/CD

GitHub Actions is used to automatically trigger application deployments
whenever new code is pushed to the `main` branch.

The workflow is stored in:

```text
.github/workflows/deploy.yml
```

The workflow configuration is:

```yaml
name: Deploy Bus Ticket Application

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: self-hosted

    steps:
      - name: Checkout repository
        uses: actions/checkout@v5

      - name: Verify Ansible
        run: ansible --version

      - name: Deploy application
        run: |
          ansible-playbook \
            -i ansible/inventory/hosts.ini \
            ansible/deploy.yml
```

### Workflow Explanation

The workflow performs the following sequence:

1. A new commit is pushed to the `main` branch.
2. GitHub detects the push and starts the workflow.
3. GitHub sends the deployment job to the self-hosted runner.
4. The runner checks out the latest version of the repository.
5. The runner verifies that Ansible is available.
6. The runner executes the Ansible deployment playbook.
7. Ansible connects to the application server.
8. The latest application files are deployed to Apache.
9. The updated website becomes available to users.

## Self-Hosted GitHub Actions Runner

The GitHub Actions runner is installed on the `ansible01` EC2 instance.

The runner allows GitHub Actions to execute deployment commands inside the
AWS environment.

The runner is installed under:

```text
/opt/actions-runner
```

It runs as a persistent systemd service and automatically connects to GitHub
to listen for new workflow jobs.

The runner uses the following GitHub Actions label:

```text
self-hosted
```

This corresponds to the workflow configuration:

```yaml
runs-on: self-hosted
```

## Automated Deployment Flow

The complete CI/CD process is:

```text
Developer
    |
    | Edit application
    v
Git Repository
    |
    | git add / git commit
    v
git-server
    |
    | git push
    v
GitHub
    |
    | Push to main detected
    v
GitHub Actions
    |
    | Sends deployment job
    v
ansible01
Self-Hosted Runner
    |
    | Runs Ansible playbook
    v
bus-ticket-app-server
    |
    | Deploys files to /var/www/html/
    v
Apache HTTP Server
    |
    v
Live Bus Ticket Application
```

## SELinux and GitHub Actions Runner Troubleshooting

During the GitHub Actions runner configuration, the runner was initially
installed under:

```text
/home/ec2-user/actions-runner
```

The runner worked when executed manually, but failed when started as a
systemd service.

The service reported:

```text
status=203/EXEC
Permission denied
```

The runner script itself had execute permissions, so Linux file permissions
were investigated.

SELinux was running in Enforcing mode:

```bash
getenforce
```

Output:

```text
Enforcing
```

The SELinux audit log showed an AVC denial for `runsvc.sh`:

```text
avc: denied { execute }
```

The runner script had the SELinux context:

```text
user_home_t
```

This prevented systemd from executing the runner script from the user's
home directory.

Instead of disabling SELinux, the runner was moved to:

```text
/opt/actions-runner
```

Ownership was assigned to `ec2-user`, and the SELinux contexts were restored:

```bash
sudo chown -R ec2-user:ec2-user /opt/actions-runner
sudo restorecon -RFv /opt/actions-runner
```

The new SELinux context became:

```text
system_u:object_r:usr_t:s0
```

The GitHub Actions runner service was then reinstalled and started.

The service successfully connected to GitHub and reported:

```text
Connected to GitHub
Listening for Jobs
```

This solution allowed SELinux to remain in Enforcing mode while allowing the
GitHub Actions runner to operate as a persistent systemd service.

## GitHub Actions Workflow Maintenance

During testing, GitHub Actions reported a Node.js runtime deprecation warning
for:

```yaml
uses: actions/checkout@v4
```

The workflow was updated to:

```yaml
uses: actions/checkout@v5
```

After the change was committed and pushed, another CI/CD workflow executed
successfully without the previous warning.

## Deployment Verification

The CI/CD pipeline was tested by modifying the application homepage message.

The original message:

```text
Bus Ticket Schedule
```

was changed to:

```text
Fast, Reliable & Automated Bus Service
```

The change was committed and pushed to GitHub.

No Ansible deployment command was manually executed.

GitHub Actions automatically:

1. Detected the push.
2. Started the deployment workflow.
3. Sent the job to the `ansible01` self-hosted runner.
4. Executed the Ansible playbook.
5. Deployed the updated application to `bus-ticket-app-server`.

After refreshing the live website, the new message appeared successfully.

This verified that the Continuous Deployment pipeline was functioning
end-to-end.

[200~## Development and Deployment Procedure

Application changes are made on the `git-server` EC2 instance.

A typical development workflow is:

```bash
cd ~/bus-ticket-application

git status

git add .

git commit -m "Describe the application change"

git push
```

After `git push`, no manual deployment to the application server is required.

The push to the `main` branch automatically triggers the GitHub Actions
workflow.

## Verification Commands

### Check Git Repository Status

```bash
git status
```

### View Recent Commits

```bash
git log --oneline -5
```

### Test Ansible Connectivity

From the Ansible control node:

```bash
ansible bus_ticket_servers -i inventory -m ping
```

A successful connection returns:

```text
bus-ticket-app-server | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
```

### Run the Ansible Playbook Manually

For troubleshooting or testing, the playbook can also be executed manually:

```bash
ansible-playbook -i inventory deploy.yml
```

### Check Apache

On the application server:

```bash
sudo systemctl status httpd
```

### Check the GitHub Actions Runner

On `ansible01`:

```bash
sudo systemctl status actions.runner.fpaida-bus-ticket-application.ansible01.service
```

### Check SELinux

```bash
getenforce
```

Expected result:

```text
Enforcing
```

## Lessons Learned

This project provided hands-on experience with several important DevOps
concepts:

- Creating and managing Linux servers in AWS EC2.
- Connecting securely to remote Linux systems with SSH.
- Managing application source code with Git and GitHub.
- Understanding local and remote Git repositories.
- Using private IP addresses for communication between AWS EC2 instances.
- Creating Ansible inventories and playbooks.
- Testing Ansible connectivity between Linux servers.
- Installing and managing Apache using automation.
- Building a GitHub Actions CI/CD workflow.
- Installing and configuring a self-hosted GitHub Actions runner.
- Running the GitHub Actions runner as a systemd service.
- Troubleshooting Linux file permissions and SELinux.
- Reading system and audit logs to identify deployment problems.
- Maintaining SELinux in Enforcing mode instead of disabling security.
- Automatically deploying application changes after a Git push.
- Verifying an end-to-end Continuous Deployment pipeline.

## Future Improvements

Possible future enhancements include:

- Configure HTTPS/TLS for secure web access.
- Configure a domain name instead of accessing the application by IP address.
- Add automated application tests before deployment.
- Add separate development, testing, and production environments.
- Add deployment rollback capabilities.
- Store sensitive configuration using secure secrets management.
- Add monitoring and centralized logging.
- Add load balancing and high availability.
- Build infrastructure using Infrastructure as Code.
- Add Docker containers for application packaging.
- Expand the application with a backend API and database.

## Project Summary

The Richard Enterprises Bus Ticket Application demonstrates a complete
introductory DevOps Continuous Deployment pipeline.

Application code is maintained with Git and stored in GitHub. A push to the
`main` branch triggers GitHub Actions. The workflow is assigned to a
self-hosted runner on the `ansible01` AWS EC2 instance. The runner executes
Ansible, which connects to the application server and deploys the latest
application files to Apache.

The completed automation flow is:

```text
Code Change
    ↓
Git Commit
    ↓
Git Push
    ↓
GitHub
    ↓
GitHub Actions
    ↓
Self-Hosted Runner
    ↓
Ansible
    ↓
AWS EC2
    ↓
Apache
    ↓
Live Application
```

This project demonstrates how source control, configuration management,
cloud infrastructure, automation, and CI/CD can work together to provide
repeatable application deployments.
