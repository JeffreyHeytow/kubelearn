export const levels = [
    {
        id: 1,
        title: "Build Your First Pod",
        description: "Drag the code lines in the correct order to create a basic Kubernetes Pod",
        lines: [
            {
                id: "line-1",
                code: "apiVersion: v1",
                indent: 0,
                explanation: "Every Kubernetes resource starts with 'apiVersion'. The 'v1' API contains core resources like Pods.",
                position: 0
            },
            {
                id: "line-2",
                code: "kind: Pod",
                indent: 0,
                explanation: "'kind' tells Kubernetes what type of resource this is. A Pod is the smallest deployable unit.",
                position: 1
            },
            {
                id: "line-3",
                code: "metadata:",
                indent: 0,
                explanation: "'metadata' contains information to identify the resource, like its name and labels.",
                position: 2
            },
            {
                id: "line-4",
                code: "name: my-pod",
                indent: 2,
                explanation: "Every resource needs a unique name. This Pod will be called 'my-pod'. Note the 2-space indent!",
                position: 3
            },
            {
                id: "line-5",
                code: "spec:",
                indent: 0,
                explanation: "'spec' (specification) defines what the Pod should run - its containers, volumes, etc.",
                position: 4
            },
            {
                id: "line-6",
                code: "containers:",
                indent: 2,
                explanation: "The 'containers' field lists all containers that should run in this Pod. Pods can have one or more containers.",
                position: 5
            },
            {
                id: "line-7",
                code: "- name: nginx",
                indent: 2,
                explanation: "The dash starts a list item. This creates our first container called 'nginx'.",
                position: 6
            },
            {
                id: "line-8",
                code: "image: nginx:1.21",
                indent: 4,
                explanation: "'image' specifies which Docker image to run. This uses nginx version 1.21 from Docker Hub.",
                position: 7
            }
        ]
    },
    {
        id: 2,
        title: "Add Resource Limits",
        description: "Extend your Pod with CPU and memory limits to prevent resource exhaustion",
        lines: [
            {
                id: "line-1",
                code: "apiVersion: v1",
                indent: 0,
                explanation: "Starting with the same apiVersion as before.",
                position: 0
            },
            {
                id: "line-2",
                code: "kind: Pod",
                indent: 0,
                explanation: "Still creating a Pod resource.",
                position: 1
            },
            {
                id: "line-3",
                code: "metadata:",
                indent: 0,
                explanation: "Metadata section for identification.",
                position: 2
            },
            {
                id: "line-4",
                code: "name: my-pod",
                indent: 2,
                explanation: "Naming our Pod 'my-pod'.",
                position: 3
            },
            {
                id: "line-5",
                code: "spec:",
                indent: 0,
                explanation: "Spec section defines what runs in the Pod.",
                position: 4
            },
            {
                id: "line-6",
                code: "containers:",
                indent: 2,
                explanation: "List of containers to run.",
                position: 5
            },
            {
                id: "line-7",
                code: "- name: nginx",
                indent: 2,
                explanation: "Our nginx container.",
                position: 6
            },
            {
                id: "line-8",
                code: "image: nginx:1.21",
                indent: 4,
                explanation: "Using nginx version 1.21.",
                position: 7
            },
            {
                id: "line-9",
                code: "resources:",
                indent: 4,
                explanation: "The 'resources' section lets you specify CPU and memory limits for this container.",
                position: 8
            },
            {
                id: "line-10",
                code: "requests:",
                indent: 6,
                explanation: "'requests' are the minimum resources guaranteed to this container.",
                position: 9
            },
            {
                id: "line-11",
                code: "memory: \"64Mi\"",
                indent: 8,
                explanation: "Request at least 64 megabytes of memory.",
                position: 10
            },
            {
                id: "line-12",
                code: "cpu: \"250m\"",
                indent: 8,
                explanation: "Request 250 millicores (0.25 CPU cores).",
                position: 11
            }
        ]
    }
];