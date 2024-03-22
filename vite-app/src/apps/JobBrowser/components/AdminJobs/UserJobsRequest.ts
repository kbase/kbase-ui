import { Job, JobsSearchExpression } from "apps/JobBrowser/store";
import { extractTimeRange, serviceJobToUIJob } from "apps/JobBrowser/utils";
import CancelableRequest, { Task } from "../../lib/CancelableRequest";
import JobBrowserBFFClient, { QueryJobsParams } from "../../lib/JobBrowserBFFClient";

interface UserJobsParam {
    token: string,
    searchExpression: JobsSearchExpression;
    username: string,
    serviceWizardURL: string,
    timeout: number;
    version: string;
}

type UserJobsResult = {
    jobs: Array<Job>,
    foundCount: number,
    totalCount: number;
};

export default class MyJobsRequest extends CancelableRequest<UserJobsParam, UserJobsResult> {
    request({ token, timeout, searchExpression, username, serviceWizardURL, version }: UserJobsParam): Task<UserJobsResult> {
        const jobBrowserBFF = new JobBrowserBFFClient({
            token,
            url: serviceWizardURL,
            timeout,
            version
        });

        const [timeRangeStart, timeRangeEnd] = extractTimeRange(searchExpression.timeRange);

        const queryParams: QueryJobsParams = {
            time_span: {
                from: timeRangeStart,
                to: timeRangeEnd
            }, // TODO: really handle sort
            offset: searchExpression.offset,
            limit: searchExpression.limit,
            timeout,
            filter: searchExpression.filter,
            admin: true
        };

        if (searchExpression.sort) {
            switch (searchExpression.sort.field) {
                case 'created':
                    queryParams.sort = [{
                        key: 'created',
                        direction: searchExpression.sort.direction
                    }];
            }
        }

        const promise = jobBrowserBFF
            .query_jobs(queryParams)
            .then(({ jobs, found_count, total_count }) => {

                return {
                    jobs: jobs.map((jobInfo) => {
                        return serviceJobToUIJob(jobInfo, username);
                    }),
                    foundCount: found_count,
                    totalCount: total_count
                };
            });

        const task: Task<UserJobsResult> = {
            id: this.newID(),
            promise,
            isCanceled: false
        };
        this.pendingTasks.set(task.id, task);
        return task;
    }
}