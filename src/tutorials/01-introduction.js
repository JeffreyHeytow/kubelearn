const tutorial = {
  id: 1,
  slug: 'introduction-to-kubernetes',
  title: 'Introduction to Kubernetes',
  description: 'Learn the basics of Kubernetes architecture',
  duration: '10 min',
  difficulty: 'Beginner',
  content: `
# Introduction to Kubernetes

## What is Kubernetes?

Kubernetes (K8s) is an open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications.

Think of Kubernetes as an operating system for your cluster - it manages where containers run, how they communicate, and how they scale.

## Why Kubernetes?

### Without Kubernetes:
- Manual container deployment
- No automatic recovery from failures
- Difficult scaling
- Complex networking between containers

### With Kubernetes:
- Automated deployment and scaling
- Self-healing (restarts failed containers)
- Service discovery and load balancing
- Declarative configuration

## Kubernetes Architecture

\`\`\`mermaid
graph TB
    subgraph "Control Plane"
        API[API Server]
        SCHED[Scheduler]
        CM[Controller Manager]
        ETCD[(etcd)]
    end
    
    subgraph "Worker Nodes"
        NODE1[Node 1]
        NODE2[Node 2]
        NODE3[Node 3]
    end
    
    API --> SCHED
    API --> CM
    API --> ETCD
    API --> NODE1
    API --> NODE2
    API --> NODE3
\`\`\`

## Key Components

### Control Plane
- **API Server**: Front-end for Kubernetes, handles all requests
- **Scheduler**: Assigns pods to nodes
- **Controller Manager**: Maintains desired state
- **etcd**: Stores all cluster data

### Worker Nodes
- **Kubelet**: Ensures containers are running
- **Kube-proxy**: Handles networking
- **Container Runtime**: Runs containers (Docker, containerd)

## Your First kubectl Commands

\`\`\`bash
# Check cluster info
kubectl cluster-info

# List all nodes
kubectl get nodes

# List all pods
kubectl get pods

# Get detailed info about a resource
kubectl describe pod <pod-name>
\`\`\`

## Next Steps

Now that you understand Kubernetes basics, you're ready to dive into Pods - the smallest deployable units in Kubernetes!
  `
};

export { tutorial as default };