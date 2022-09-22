require 'net/http'
require 'json'
require 'csv'

class Service 
    def initialize(env)
        @env = env
        if env == 'prod'
            @host = 'kbase.us'
        else
            @host = "#{env}.kbase.us"
        end
    end

end

class JSONRPC  < Service
    def initialize(env, module_path, module_name)
        super(env)
        @module_path = module_path
        @module_name = module_name
    end

    def call(module_function, params=false)
        uri = URI("https://#{@host}/services/#{@module_path}")
        request = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
        if params
            request_params = [params]
        else
            request_params = []
        end
        request.body = {
            version: '1.1',
            id: '123',
            method: "#{@module_name}.#{module_function}",
            params: request_params
        }.to_json
        response = Net::HTTP.start(uri.hostname, uri.port, :use_ssl => true) do |http|
            http.request(request)
        end
    
        return JSON.parse(response.body)['result'][0]
    end
end

class Rest < Service
    def initialize(env, path)
        super(env)
        @path = path
    end

    def get(api_path=false)
        if api_path
            uri = URI("https://#{@host}/services/#{@path}/#{api_path}")
        else
            uri = URI("https://#{@host}/services/#{@path}/")
        end
        request = Net::HTTP::Get.new(uri, 'Content-Type' => 'application/json')
        request['Accept'] = 'application/json'
        response = Net::HTTP.start(uri.hostname, uri.port, :use_ssl => true) do |http|
            http.request(request)
        end
        return JSON.parse(response.body)
    end
end

class Workspace < JSONRPC
    def initialize(env)
        super(env, 'ws', 'Workspace')
    end

    def ver
        call 'ver'
    end
end

class Catalog < JSONRPC
    def initialize(env)
        super(env, 'catalog', 'Catalog')
    end

    def version
        call 'version'
    end
end

class NMS < JSONRPC
    def initialize(env)
        super(env, 'narrative_method_store/rpc', 'NarrativeMethodStore')
    end

    def ver
        call 'ver'
    end
end

class UserProfile < JSONRPC
    def initialize(env)
        super(env, 'user_profile/rpc', 'UserProfile')
    end

    def ver
        call 'ver'
    end
end

class Search < JSONRPC
    def initialize(env) 
        super(env, 'searchapi', 'KBaseSearchEngine')
    end

    def version
        call('status')['version']
    end
end

class NJS < JSONRPC
    def initialize(env)
        super(env, 'njs_wrapper', 'NarrativeJobService')
    end

    def version
        call('ver')
    end
end

class Feeds < Rest
    def initialize(env)
        super(env, 'feeds')
    end

    def version
        get()['version']
    end
end

class Groups < Rest
    def initialize(env)
        super(env, 'groups')
    end

    def version
        get()['version']
    end
end

class Auth < Rest
    def initialize(env)
        super(env, 'auth')
    end

    def version
        get()['version']
    end
end

def core_services()
    [
        [
            'Workspace',
            Workspace.new('ci').ver,
            Workspace.new('next').ver,
            Workspace.new('prod').ver
        ],
        [
            'Catalog',
            Catalog.new('ci').version,
            Catalog.new('next').version,
            Catalog.new('prod').version
        ],
        [
            'Narrative Method Store',
            NMS.new('ci').ver,
            NMS.new('next').ver,
            NMS.new('prod').ver
        ],
        [
            'User Profile',
            UserProfile.new('ci').ver,
            UserProfile.new('next').ver,
            UserProfile.new('prod').ver
        ],
        [
            'Search',
            Search.new('ci').version,
            Search.new('next').version,
            Search.new('prod').version
        ],
        [
            'Feeds',
            Feeds.new('ci').version,
            Feeds.new('next').version,
            Feeds.new('prod').version
        ],
        [
            'Groups',
            Groups.new('ci').version,
            Groups.new('next').version,
            Groups.new('prod').version
        ],
        [
            'Auth',
            Auth.new('ci').version,
            Auth.new('next').version,
            Auth.new('prod').version
        ],
        [
            'NJS',
            NJS.new('ci').version,
            NJS.new('next').version,
            NJS.new('prod').version
        ]
    ]
end

def job_status
    result = core_services
    CSV.open('out.csv', 'wb') do |csv|
        csv << ['service', 'ci', 'next', 'prod']
        result.each do |row|
            csv << row
        end
    end
end

job_status

