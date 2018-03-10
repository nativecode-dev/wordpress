# STAGE: BUILD
###############################################################################

FROM microsoft/dotnet:2.0-sdk as BUILD

ENV REPO_URL="https://github.com/cloudfoundry-samples/dotnet-core-hello-world.git"
ENV REPO_BUILD=/build

RUN set -ex \
  && git clone $REPO_URL $REPO_BUILD \
  && cd $REPO_BUILD \
  && dotnet publish -c release -o published \
  ;

# STAGE: FINALIZE
###############################################################################

FROM microsoft/dotnet-nightly:2.1-runtime-alpine
COPY --from=BUILD /build/published/* /app/

ENV ASPNETCORE_URLS=http://+:5000

EXPOSE 5000/tcp
CMD ["dotnet", "/app/dotnet-core-hello-world.dll"]
