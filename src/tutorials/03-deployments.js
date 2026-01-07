const tutorial = {
  id: 3,
  slug: 'deployments-explained',
  title: 'Deployments Explained',
  description: 'Master Kubernetes Deployments',
  duration: '20 min',
  difficulty: 'Intermediate',
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
};

export { tutorial as default };