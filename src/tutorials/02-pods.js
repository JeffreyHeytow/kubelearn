const tutorial = {
  id: 2,
  slug: 'understanding-pods',
  title: 'Understanding Pods',
  description: 'Deep dive into Kubernetes Pods',
  duration: '15 min',
  difficulty: 'Beginner',
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
};

export { tutorial as default };