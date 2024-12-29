# Security

## Build a secure base image

- Use trusted or recognize sources to build a image
- Maintain a level of authenticity within your image within your image where it can be safely regarded as a secure and trusted baseline
- Use public repositories with caution
- Revisit your base images regularly to ensure they are also updated with the latest OS patches and bug fixes

Good practice:
- For each vulnerability detected, you should define the impact and severity

Considerations:

- is every image used in the CI/CD pipeline scaned?
- do you scan all images registries to ensure that images that either skipped the CI/CD process or images that have gone stale, are secure?
- how can you prevent users from running images outside the pipeline?
- does the image include sensitive data? Embedded secrets?
- does the image include only executables required for its ongoing operation?
- are there any vulnerabilities at the base image itself or in added open-source components?
- is the image configured with root/admin account by default?

- Have a minimalistic approach when building the base image, including only the necessary dependencies and packages.
- Enable security features such as SELinux or AppArmor to provide an additional layer of protection.
- Implement a secure build process, including using secure build tools and verifying the integrity of the build environment.
- Use multi-stage builds to separate the build environment from the runtime environment, reducing the attack surface.
- Implement secure configuration practices, such as disabling unnecessary services and limiting privileges within the container.
- Use container security tools and scanners to identify and address any security issues in the base image.
- Implement secure image signing and verification mechanisms to ensure the authenticity and integrity of the base image.
- Regularly review and update the base image to incorporate any security best practices or recommendations from the container runtime provider.
