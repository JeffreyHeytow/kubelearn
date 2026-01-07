import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import './Tutorial.css';

// Tutorial content
const tutorialContent = {
  1: {
    title: 'Introduction to Kubernetes',
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
  },
  2: {
    title: 'Understanding Pods',
    content: `
# Understanding Kubernetes Pods

## What is a Pod?

A Pod is the smallest and simplest unit in Kubernetes. It represents a single instance of a running process in your cluster.

**Key concept**: A Pod can contain one or more containers that share:
- Network namespace (same IP address)
- Storage volumes
- Lifecycle

## Pod Architecture

\`\`\`mermaid
graph LR
    subgraph Pod
        C1[Container 1<br/>nginx]
        C2[Container 2<br/>sidecar]
        VOL[Shared Volume]
        NET[Network: 10.0.1.5]
    end
    
    C1 -.-> VOL
    C2 -.-> VOL
    C1 -.-> NET
    C2 -.-> NET
\`\`\`

## Why Pods, Not Just Containers?

Pods solve several problems:

1. **Co-location**: Tightly coupled containers can run together
2. **Shared Resources**: Containers share network and storage
3. **Atomic Scheduling**: All containers in a pod are scheduled together
4. **Lifecycle Management**: Managed as a single unit

## Single Container Pod

Most common pattern - one container per pod:

\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: web
spec:
  containers:
  - name: nginx
    image: nginx:1.21
    ports:
    - containerPort: 80
\`\`\`

## Multi-Container Pod

Multiple containers that need to work together:

\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-sidecar
spec:
  containers:
  - name: app
    image: myapp:1.0
    ports:
    - containerPort: 8080
  
  - name: log-forwarder
    image: fluentd:latest
    volumeMounts:
    - name: logs
      mountPath: /var/log
  
  volumes:
  - name: logs
    emptyDir: {}
\`\`\`

## Pod Lifecycle

\`\`\`mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> Running: Containers starting
    Running --> Succeeded: All containers exit (0)
    Running --> Failed: Container exits (non-zero)
    Running --> Unknown: Node unreachable
    Failed --> [*]
    Succeeded --> [*]
\`\`\`

### Phase Explanations:
- **Pending**: Pod accepted but not running yet
- **Running**: At least one container is running
- **Succeeded**: All containers terminated successfully
- **Failed**: At least one container failed
- **Unknown**: Pod state cannot be determined

## Common kubectl Commands for Pods

\`\`\`bash
# Create a pod from YAML
kubectl apply -f pod.yaml

# List all pods
kubectl get pods

# Get detailed pod info
kubectl describe pod nginx-pod

# View pod logs
kubectl logs nginx-pod

# Execute command in pod
kubectl exec -it nginx-pod -- /bin/bash

# Delete a pod
kubectl delete pod nginx-pod
\`\`\`

## Pod Best Practices

1. **One concern per container**: Don't run multiple apps in one container
2. **Use init containers**: For setup tasks before main container starts
3. **Set resource limits**: Prevent pods from consuming all resources
4. **Use health checks**: Liveness and readiness probes
5. **Avoid running as root**: Use security contexts

## Resource Requests and Limits

Always specify resources:

\`\`\`yaml
spec:
  containers:
  - name: nginx
    image: nginx:1.21
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
\`\`\`

## Next Steps

Pods are rarely created directly in production. Instead, you'll use Deployments to manage Pods - that's our next tutorial!
    `
  },
  3: {
    title: 'Deployments Explained',
    content: `
# Kubernetes Deployments

## What is a Deployment?

A Deployment provides declarative updates for Pods and ReplicaSets. It's the recommended way to deploy stateless applications in Kubernetes.

**Key benefits**:
- Automated rollouts and rollbacks
- Scaling up/down
- Self-healing
- Version history

## Deployment vs Pods

\`\`\`mermaid
graph TB
    DEP[Deployment]
    RS[ReplicaSet]
    POD1[Pod 1]
    POD2[Pod 2]
    POD3[Pod 3]
    
    DEP --> RS
    RS --> POD1
    RS --> POD2
    RS --> POD3
\`\`\`

**Never create Pods directly!** Use Deployments instead.

## Basic Deployment

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
\`\`\`

## How Deployments Work

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Deployment
    participant ReplicaSet
    participant Pods
    
    User->>Deployment: Create with replicas=3
    Deployment->>ReplicaSet: Create ReplicaSet
    ReplicaSet->>Pods: Create 3 Pods
    Pods-->>User: 3 Pods running
\`\`\`

## Rolling Updates

When you update a Deployment, Kubernetes:
1. Creates new ReplicaSet
2. Gradually scales up new pods
3. Gradually scales down old pods
4. Ensures availability throughout

\`\`\`bash
# Update image version
kubectl set image deployment/nginx-deployment nginx=nginx:1.22
\`\`\`

\`\`\`mermaid
graph LR
    subgraph "Old ReplicaSet"
        O1[Pod v1.21]
        O2[Pod v1.21]
        O3[Pod v1.21]
    end
    
    subgraph "New ReplicaSet"
        N1[Pod v1.22]
        N2[Pod v1.22]
        N3[Pod v1.22]
    end
    
    O1 -.->|Scale down| X1[ ]
    O2 -.->|Scale down| X2[ ]
    O3 -.->|Scale down| X3[ ]
    
    N1
    N2
    N3
\`\`\`

## Scaling

Scale up or down easily:

\`\`\`bash
# Scale to 5 replicas
kubectl scale deployment nginx-deployment --replicas=5

# Auto-scale based on CPU
kubectl autoscale deployment nginx-deployment --min=2 --max=10 --cpu-percent=80
\`\`\`

## Rollback

Made a mistake? Roll back instantly:

\`\`\`bash
# View rollout history
kubectl rollout history deployment/nginx-deployment

# Rollback to previous version
kubectl rollout undo deployment/nginx-deployment

# Rollback to specific revision
kubectl rollout undo deployment/nginx-deployment --to-revision=2
\`\`\`

## Deployment Strategies

### RollingUpdate (Default)
Gradually replaces old pods with new ones:

\`\`\`yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Max pods above desired count
      maxUnavailable: 0  # Max pods that can be unavailable
\`\`\`

### Recreate
Kills all old pods before creating new ones:

\`\`\`yaml
spec:
  strategy:
    type: Recreate
\`\`\`

## Health Checks

Always add health checks:

\`\`\`yaml
spec:
  containers:
  - name: nginx
    image: nginx:1.21
    ports:
    - containerPort: 80
    
    # Checks if container is alive
    livenessProbe:
      httpGet:
        path: /healthz
        port: 80
      initialDelaySeconds: 3
      periodSeconds: 3
    
    # Checks if container is ready for traffic
    readinessProbe:
      httpGet:
        path: /ready
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 5
\`\`\`

## Common kubectl Commands

\`\`\`bash
# Create deployment
kubectl apply -f deployment.yaml

# List deployments
kubectl get deployments

# Get detailed info
kubectl describe deployment nginx-deployment

# View rollout status
kubectl rollout status deployment/nginx-deployment

# Pause/resume rollout
kubectl rollout pause deployment/nginx-deployment
kubectl rollout resume deployment/nginx-deployment

# Delete deployment
kubectl delete deployment nginx-deployment
\`\`\`

## Best Practices

1. **Always set resource limits**
2. **Use health checks** (liveness + readiness)
3. **Use multiple replicas** for availability
4. **Tag images properly** (avoid :latest)
5. **Test rollouts** in staging first
6. **Set up monitoring** and alerts
7. **Use labels** for organization

## Next Steps

Deployments manage your Pods, but how do users access them? That's where Services come in - stay tuned for the next tutorial!
    `
  }
};

export default function Tutorial() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tutorial = tutorialContent[id];

  useEffect(() => {
    window.scrollTo(0, 0);
    
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'base',
      themeVariables: {
        primaryColor: '#667eea',
        primaryTextColor: '#1a1a1a',
        primaryBorderColor: '#667eea',
        lineColor: '#667eea',
        secondaryColor: '#764ba2',
        tertiaryColor: '#f0f0f0',
        background: '#ffffff',
        mainBkg: '#f8f9ff',
        secondBkg: '#e8ebff',
        labelTextColor: '#1a1a1a',
        nodeBorder: '#667eea',
        clusterBkg: '#f8f9ff',
        clusterBorder: '#667eea',
        edgeLabelBackground: '#ffffff',
        fontSize: '16px'
      }
    });
    
    setTimeout(() => {
      mermaid.contentLoaded();
    }, 100);
  }, [id]);

  if (!tutorial) {
    return (
      <div className="tutorial-page">
        <nav className="navbar">
          <h2 onClick={() => navigate('/')}>KubeLearn</h2>
          <div className="nav-links">
            <span onClick={() => navigate('/tutorials')}>Tutorials</span>
            <span>Playground</span>
            <span>Generator</span>
          </div>
        </nav>
        <div className="tutorial-container">
          <h1>Tutorial not found</h1>
          <button onClick={() => navigate('/tutorials')}>Back to Tutorials</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tutorial-page">
      <nav className="navbar">
        <h2 onClick={() => navigate('/')}>KubeLearn</h2>
        <div className="nav-links">
          <span onClick={() => navigate('/tutorials')}>Tutorials</span>
          <span>Playground</span>
          <span>Generator</span>
        </div>
      </nav>
      
      <div className="tutorial-container">
        <button className="back-button" onClick={() => navigate('/tutorials')}>
          ← Back to Tutorials
        </button>
        
        <article className="tutorial-content">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '');
                const lang = match ? match[1] : '';
                
                if (lang === 'mermaid') {
                  return (
                    <div className="mermaid">
                      {String(children).replace(/\n$/, '')}
                    </div>
                  );
                }
                
                return !inline ? (
                  <pre>
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {tutorial.content}
          </ReactMarkdown>
          
          {/* Navigation buttons */}
          <div className="tutorial-navigation">
            <div className="tutorial-nav-buttons">
              {parseInt(id) > 1 && (
                <button 
                  className="nav-button prev-button"
                  onClick={() => navigate(`/tutorial/${parseInt(id) - 1}`)}
                >
                  ← Previous Tutorial
                </button>
              )}
              
              {parseInt(id) < Object.keys(tutorialContent).length && (
                <button 
                  className="nav-button next-button"
                  onClick={() => navigate(`/tutorial/${parseInt(id) + 1}`)}
                >
                  Next Tutorial →
                </button>
              )}
            </div>
            
            <button 
              className="nav-button playground-button"
              onClick={() => alert('Playground coming soon!')}
            >
              Try the Playground 🎮
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}